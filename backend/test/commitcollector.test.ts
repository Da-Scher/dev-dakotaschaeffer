import {expect, afterEach, describe, vi, it} from "vitest";
import {vol} from "memfs";
import {
    commitsJsonExists,
    fetchGitHubRepos,
    fetchGitHubCommits,
    normalizeCommits,
    repoFresh,
    commitFresh
} from "../src";
import {CommitActivityResponse} from "../../src/types/commit";
import {fakerCommitList, fakerRepoList, makeGitHubCommit, makeGitHubRepository} from "./faker/fakerConfig";
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
            './../../public/data/commits.json': "{}"
        })
        const result = await commitsJsonExists();
        expect(result).toBe(true);
    })

    it(`should return false if commits.json does not exist`, async () => {
        vol.fromJSON({
            './../../public/data/' : undefined,
        })
        const result = await commitsJsonExists();
        expect(result).toBe(false);
    })
})
describe(`fetchGitHubCommits`, () => {
    it(`should return a list of valid commits`, async () => {
        mockFetchJson(fakerCommitList())
        const commitsList: GitHubCommit[] =
            await fetchGitHubCommits(
                new Date(2025, 6, 1, 0, 0, 0, 0).toISOString(),
                ["blah"]
            );

        for (const commit of commitsList) {

            const now: Date = new Date();
            const author: {name: string, date: string} | null = commit.commit.author;
            expect(author).not.toBe(null);
            if(author === null) continue;
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
    });

    describe(`Function commitFresh in fetchGitHubCommits()`, () => {
        it(`should return false for a stale commit and generatedAt = null`, () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));
            const commitAccepted: boolean = commitFresh(null, makeGitHubCommit({
                age: "stale",
                now: new Date(),
                repo: makeGitHubRepository({
                    age: "stale",
                    now: new Date(),
                    overrides: {name: "exampleStaleRepo"},
                    owner: "exampleName"
                })
            }));
            vi.useRealTimers();

            expect(commitAccepted).toBe(false);

        });

        it(`should return false for a stale commit and generatedAt < now`, () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));
            const commitAccepted: boolean =
                commitFresh(
                    new Date(2025, 11, 30, 23, 0, 0, 0).toISOString(),
                    makeGitHubCommit({
                        age: "stale",
                        now: new Date(),
                        repo: makeGitHubRepository({
                            age: "stale",
                            now: new Date(),
                            overrides: {name: "exampleStaleRepo"},
                            owner: "exampleName"
                        })
                    })
                );
            vi.useRealTimers();

            expect(commitAccepted).toBe(false);
        });

        it(`should return false for a stale commit and generatedAt > now`, () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));
            const commitAccepted: boolean =
                commitFresh(
                    new Date(2026, 1, 1, 1, 1, 1, 1).toISOString(),
                    makeGitHubCommit({
                        age: "stale",
                        now: new Date(),
                        repo: makeGitHubRepository({
                            age: "stale",
                            now: new Date(),
                            overrides: {name: "exampleStaleRepo"},
                            owner: "exampleName"
                        })
                    })
                );
            vi.useRealTimers();

            expect(commitAccepted).toBe(false);

        });

        it(`should return true for an edge commit and generatedAt = null`, () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));

            const commitAccepted: boolean = commitFresh(null, makeGitHubCommit({
                age: "edge",
                now: new Date(),
                repo: makeGitHubRepository({
                    age: "edge",
                    now: new Date(),
                    overrides: {name: "exampleEdgeRepo"},
                    owner: "exampleName"
                })
            }));
            vi.useRealTimers();

            expect(commitAccepted).toBe(true);
        });
        it(`should return true for an edge commit and generatedAt < now`, () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 1, 0, 0, 0, 0));

            const commitAccepted: boolean =
                commitFresh(
                    new Date(2025, 0, 1, 0, 0, 0, 0).toISOString(),
                    makeGitHubCommit({
                        age: "edge",
                        now: new Date(2026, 0, 1, 0, 0, 0, 0),
                        repo: makeGitHubRepository({
                            age: "edge",
                            now: new Date(),
                            overrides: {name: "exampleEdgeRepo"},
                            owner: "exampleName"
                        })
                    })
                );
            vi.useRealTimers();

            expect(commitAccepted).toBe(true);
        });
        it(`should return false for an edge commit and generatedAt > now`, () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));

            const commitAccepted: boolean =
                commitFresh(
                    new Date(2026, 1, 0, 0, 0, 0, 0).toISOString(),
                    makeGitHubCommit({
                        age: "edge",
                        now: new Date(),
                        repo: makeGitHubRepository({
                            age: "edge",
                            now: new Date(),
                            overrides: {name: "exampleEdgeRepo"},
                            owner: "exampleName"
                        })
                    })
                );
            vi.useRealTimers();

            expect(commitAccepted).toBe(false);
        });
        it(`should return true with a fresh commit and generatedAt = null`, () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));

            const commitAccepted: boolean = commitFresh(null, makeGitHubCommit({
                age: "fresh",
                now: new Date(),
                repo: makeGitHubRepository({
                    age: "fresh",
                    now: new Date(),
                    overrides: {name: "exampleFreshRepo"},
                    owner: "exampleName"
                })
            }));
            vi.useRealTimers();

            expect(commitAccepted).toBe(true);
        });
        it(`should return true for a fresh commit and generatedAt < now`, () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 1, 0, 0, 0, 0));

            const commitAccepted: boolean =
                commitFresh(
                    new Date(2025, 0, 1, 0, 0, 0, 0).toISOString(),
                    makeGitHubCommit({
                        age: "fresh",
                        now: new Date(),
                        repo: makeGitHubRepository({
                            age: "fresh",
                            now: new Date(),
                            overrides: {name: "exampleFreshRepo"},
                            owner: "exampleName"
                        })
                    })
                );
            vi.useRealTimers();

            expect(commitAccepted).toBe(true);
        });
        it(`should return false for a fresh commit and generatedAt > now`, () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));

            const commitAccepted: boolean =
                commitFresh(
                    new Date(2026, 1, 0, 0, 0, 0, 0).toISOString(),
                    makeGitHubCommit({
                        age: "fresh",
                        now: new Date(),
                        repo: makeGitHubRepository({
                            age: "fresh",
                            now: new Date(),
                            overrides: {name: "exampleFreshRepo"},
                            owner: "exampleName"
                        })
                    })
                );
            vi.useRealTimers();

            expect(commitAccepted).toBe(false);
        });
    });
});

describe(`fetchGitHubRepos`, () => {
    describe(`stress test`, () => {
        it(`should return a list of 100 valid repos`, async () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 1, 0, 0, 0, 0));
            mockFetchJson(fakerRepoList({age: "fresh", count: 100}));
            const repos: string[] = await fetchGitHubRepos(new Date(2025, 0, 1, 0, 0, 0, 0).toISOString())
            expect(repos.length).toBe(100)

        });
        it(`should return a list of 1_000 valid repos`, async () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 1, 0, 0, 0, 0));
            mockFetchJson(fakerRepoList({age: "fresh", count: 1_000}));
            const repos: string[] = await fetchGitHubRepos(new Date(2025, 0, 1, 0, 0, 0, 0).toISOString())
            expect(repos.length).toBe(1_000)

        });
        it(`should return a list of 10_000 valid repos`, async () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 1, 0, 0, 0, 0));
            mockFetchJson(fakerRepoList({age: "fresh", count: 10_000}));
            const repos: string[] = await fetchGitHubRepos(new Date(2025, 0, 1, 0, 0, 0, 0).toISOString())
            expect(repos.length).toBe(10_000)

        });
    })
    describe(`repoFresh`, () => {
        it(`should return true for one fresh repo`, async () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));
            const repoValid: boolean =
                repoFresh(
                    new Date(2025, 0, 1, 0, 0, 0, 0).toISOString(),
                    makeGitHubRepository({ age: "fresh", now: new Date()})
                );
            expect(repoValid).toBe(true);
        });

        it(`should return true for one edge repo`, async () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 1, 0, 0, 0, 0));
            const repoValid: boolean =
                repoFresh(
                    new Date(2025, 0, 1, 0, 0, 0, 0).toISOString(),
                    makeGitHubRepository({ age: "edge", now: new Date()})
                );
            expect(repoValid).toBe(true);
        });
        it(`should return false for one stale repo`, async () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 0, 0, 0, 0, 0));
            mockFetchJson([makeGitHubRepository({age: "stale", now: new Date()})])
            const repoValid: boolean =
                repoFresh(
                    new Date(2025, 11, 30, 0, 0, 0, 0).toISOString(),
                    makeGitHubRepository({ age: "stale", now: new Date()})
                );
            expect(repoValid).toBe(false);
        });
    });
})

describe(`normalizeGitHubCommits`, async () => {
    it(`creates a CommitActivityResponse`, async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 0, 1, 0, 0, 0, 0));
        const now: string = new Date().toISOString();

        try {
            mockFetchJson([makeGitHubRepository({age: "fresh", now: new Date(), overrides: {name: "exampleName"}})])

            const repoList: string[] = await fetchGitHubRepos(
                new Date(2025, 0, 1, 0, 0, 0, 0).toISOString(),
            );
            mockFetchJson([makeGitHubCommit({
                age: "fresh",
                now: new Date(),
                repo: makeGitHubRepository({age: "fresh", now: new Date(), overrides: {name: "exampleName"}})
            })])

            const commitList: GitHubCommit[] =
                await fetchGitHubCommits(
                    new Date(2025, 0, 1, 0, 0, 0, 0).toISOString(),
                    repoList
            );
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