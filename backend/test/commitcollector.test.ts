import {expect, afterEach, describe, vi, it} from "vitest";
import {vol} from "memfs";
import {commitsJsonExists, fetchGitHubRepos, fetchGitHubCommits, normalizeCommits} from "../index";
import {CommitActivityResponse} from "../../src/types/commit";
import {fakerCommitList, makeGitHubCommit, makeGitHubRepository} from "./faker/fakerConfig";
import {GitHubCommit} from "../types/github";

vi.mock("node:fs")
vi.mock("node:fs/promises")

const MS_IN_DAY: number = 24 * 60 * 60 * 1000;
const MAX_AGE_MS: number = 364 * MS_IN_DAY;

function mockFetchJson(data: unknown, status: number = 200): void {
    vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify(data),
                {
                    status,
                    headers: {
                        "content-type": "application/json",
                    }
                }
            )
        )
    )
}

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vol.reset();
})

it(`returns the mocked fixture`, async () => {
    const fixture = fakerCommitList();
    mockFetchJson(fixture);
    const response: Response = await fetch("https://example.com/commit", {});
    const parsed: GitHubCommit = await response.json();
    expect(parsed).toEqual(fixture);
})

describe(`commitsJsonExists`, () => {
    it(`should return true if commits.json exists`, async () => {
        vol.fromJSON({
            '../../public/data/commits.json': "{}"
        })
        const result = await commitsJsonExists();
        expect(result).toBe(true);
    })

    it(`should return false if commits.json does not exist`, async () => {
        vol.fromJSON({
            '../../public/data/' : undefined,
        })
        const result = await commitsJsonExists();
        expect(result).toBe(false);
    })
})
describe(`fetchGitHubCommits`, () => {
    describe(`Function commitFresh in fetchGitHubCommits()`, () => {
        it(`should return a list of valid commits`, async () => {
            mockFetchJson(fakerCommitList())
            const commitsList: GitHubCommit[] = await fetchGitHubCommits(["blah"]);

            for (const commit of commitsList) {

                const now: Date = new Date();
                const author: {name: string, date: string} | null = commit.commit.author;
                expect(author).not.toBe(null);
                if(author === null) continue;
                console.log(author);
                const authoredAt: Date = new Date(author.date);
                const ageMS: number = now.getTime() - authoredAt.getTime();

                expect(
                    ageMS,
                    `${commit.sha} was pushed at ${author.date}`
                ).toBeGreaterThanOrEqual(0)

                expect(
                    ageMS,
                    `${commit.sha} is older than 364 days ago. ${author.date}`,
                ).toBeLessThanOrEqual(MAX_AGE_MS)
            }
        })

        it(`should drop a stale commit`, async () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));
            const commits: GitHubCommit[] = commitFresh([makeGitHubCommit({
                age: "stale",
                now: new Date(),
                repo: makeGitHubRepository({
                    age: "stale",
                    now: new Date(),
                    overrides: {name: "exampleStaleRepo"},
                    owner: "exampleName"
                })
            })]);
            vi.useRealTimers();

            expect(commits.length).toBe(0);

        });

        it(`should accept an edge commit`, async () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));

            const commits: GitHubCommit[] = commitFresh([makeGitHubCommit({
                age: "edge",
                now: new Date(),
                repo: makeGitHubRepository({
                    age: "edge",
                    now: new Date(),
                    overrides: {name: "exampleEdgeRepo"},
                    owner: "exampleName"
                })
            })]);
            vi.useRealTimers();

            expect(commits.length).toBe(1);
        });
        it(`should accept a fresh commit`, async () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));

            const commits: GitHubCommit[] = commitFresh([makeGitHubCommit({
                age: "fresh",
                now: new Date(),
                repo: makeGitHubRepository({
                    age: "fresh",
                    now: new Date(),
                    overrides: {name: "exampleEdgeRepo"},
                    owner: "exampleName"
                })
            })]);
            vi.useRealTimers();

            expect(commits.length).toBe(1);
        });
    });
});

describe(`fetchGitHubRepos`, () => {
    it(`should return a list of one valid repo`, async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));
        mockFetchJson([makeGitHubRepository({age: "fresh", now: new Date()})])
        const repos: string[] = await fetchGitHubRepos();
        expect(repos.length).toBe(1)
    });

    it(`should return a list of one edge repo`, async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));
        mockFetchJson([makeGitHubRepository({age: "edge", now: new Date()})])
        const repos: string[] = await fetchGitHubRepos();
        vi.unstubAllGlobals();
        expect(repos.length).toBe(1)
    });
    it(`should not return a repo that is too old.`, async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));
        mockFetchJson([makeGitHubRepository({age: "stale", now: new Date()})])
        const repos: string[] = await fetchGitHubRepos();
        console.log(repos);
        expect(repos.length).toBe(0);
        console.log(repos);
    });
});

describe(`normalizeGitHubCommits`, async () => {
    it(`creates a CommitActivityResponse`, async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));
        const now: string = new Date().toISOString();

        try {
            mockFetchJson([makeGitHubRepository({age: "fresh", now: new Date(), overrides: {name: "exampleName"}})])

            const repoList: string[] = await fetchGitHubRepos();
            mockFetchJson([makeGitHubCommit({
                age: "fresh",
                now: new Date(),
                repo: makeGitHubRepository({age: "fresh", now: new Date(), overrides: {name: "exampleName"}})
            })])

            const commitList: GitHubCommit[] = await fetchGitHubCommits(repoList)
            expect(
                commitList,
                `commitList is null.`)
                .not.toBe(null);
            const normalizedCommitList: CommitActivityResponse = normalizeCommits(commitList);

            vi.useRealTimers();
            expect(
                normalizedCommitList,
                `normalizedCommitList is null.`)
                .not.toBe(null);
            expect(
                normalizedCommitList?.generatedAt,
                `normalizedCommit.generated = ${normalizedCommitList?.generatedAt} should be ${now}.`)
                .toBe(now);
            expect(
                normalizedCommitList?.commits.length,
                `normalizedCommit.commits length should be 1.`)
                .toBe(1);
            expect(
                normalizedCommitList?.commits[0].repo,
                `normalizedCommitList.commits[0]'s repo should be exampleName.`)
                .toBe("exampleName");
        } catch (e) {
            console.error(e);
        }

        vi.unstubAllGlobals();
    })
});