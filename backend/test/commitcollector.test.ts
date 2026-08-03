import {expect, afterEach, describe, vi, it} from "vitest";
import {vol} from "memfs";
import {commitsJsonExists, fetchGitHubRepos} from "../index";
import {CommitActivityResponse} from "../../src/types/commit";
import {fakerRepoList, makeGitHubCommit, makeGitHubRepository} from "./faker/fakerConfig";
import {GitHubCommit, GitHubRepository} from "../types/github";

vi.mock("node:fs")
vi.mock("node:fs/promises")

const MS_IN_DAY: number = 24 * 60 * 60 * 1000;
const MAX_AGE_MS: number = 364 * MS_IN_DAY;

function mockFetchJson(data: unknown, status: number = 200): void {
    vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValueOnce(
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

describe(`commitsJsonExists`, () => {
    it(`should return true if commits.json exists`, async () => {
        vol.fromJSON({
            '../../public/data/commits.json': "{}"
        })
        const result = await commitsJsonExists();
        expect(result).toBe(true);
    })

    it(`should return false if commits.json does not exist`, async () => {
        vol.reset()
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

            const commitsList: GitHubCommit[] = mixCommitList();

            for (const commit of commitsList) {
                expect(commit?.commit?.author?.date).not.toBe(null);

                const now: Date = new Date();

                const authoredAt: Date = new Date(commit.authoredAt);
                const ageMS: number = now.getTime() - authoredAt.getTime();

                expect(
                    ageMS,
                    `${commit.sha} was pushed at ${commit.authoredAt}`
                ).toBeGreaterThanOrEqual(0)

                expect(
                    ageMS,
                    `${commit.sha} is older than 364 days ago`,
                ).toBeLessThan(MAX_AGE_MS)
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

            const commits: GitHubCommit[] = freshCommit([makeGitHubCommit({
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
    describe(`Function repoFresh in fetchGitHubRepos()`, () => {
        it(`repoFresh drops repos that are older than 364 days.`, async () => {

            // freeze time for safety.

            const mixRepoList: GitHubRepository[] = fakerRepoList();

            const repos: GitHubRepository[] = await repoFresh(mixRepoList);

            for (const repo of repos) {
                expect(repo.pushed_at).not.toBe(null);
                const now: Date = new Date();

                const pushedAt: Date = new Date(repo.pushed_at);
                const ageMS: number = now.getTime() - pushedAt.getTime();

                expect(
                    ageMS,
                    `${repo.name} was last pushed at ${repo.pushed_at}`
                ).toBeGreaterThanOrEqual(0)

                expect(
                    ageMS,
                    `${repo.name} is older than 364 days ago`,
                ).toBeLessThan(MAX_AGE_MS)
            }
        })

        it(`should return a list of one valid repo`, async () => {
            mockFetchJson([makeGitHubRepository({age: "fresh", now: new Date()})])

            const repos: string[] = await fetchGitHubRepos();

            expect(repos.length).toBe(1)
        })

        it(`should return a list of one edge repo`, async () => {
            mockFetchJson([makeGitHubRepository({age: "edge", now: new Date()})])

            const repos: string[] = await fetchGitHubRepos();

            vi.unstubAllGlobals();
            expect(repos.length).toBe(1)
        })

        it(`should not return a repo that is too old.`, async () => {
            mockFetchJson([makeGitHubRepository({age: "stale", now: new Date()})])

            const repos: string[] = await fetchGitHubRepos();

            vi.unstubAllGlobals();

            expect(repos.length).toBe(0);

        })

    });
});

describe(`normalizeGitHubCommits`, () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));
    const now: string = new Date().toISOString();
    mockFetchJson([makeGitHubRepository({age: "fresh", now: new Date(), overrides: {name: "exampleName"}})])

    const repoList = fetchGitHubRepos();
    mockFetchJson(makeGitHubCommit({age: "fresh", now: new Date(), repo: makeGitHubRepository({age: "fresh", now: new Date(), overrides: {name: "exampleName"}})}))

    const commitList: Promise<GitHubCommit[]> = fetchGitHubCommits(repoList);
    expect(
        commitList,
        `commitList is null.`)
        .not.toBe(null);
    const normalizedCommitList: Promise<CommitActivityResponse> = normalizeCommits(commitList);

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
        normalizedCommitList?.commits?.length,
        `normalizedCommit.commits length should be 1.`)
        .toBe(1);
    expect(
        normalizedCommitList?.commits[0]?.repo,
        `normalizedCommitList.commits[0]'s repo should be exampleName.`)
        .toBe("exampleName");
    vi.unstubAllGlobals();
});