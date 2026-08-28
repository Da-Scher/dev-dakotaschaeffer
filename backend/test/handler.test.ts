import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {
    CommitPayload, handler, getFileLanguage, CommitFile,
    NormalizedLanguageStats, normalizeLanguageStatistics, normalizeCommit
} from "../src/lambda/handler";

import {getGHCommit, GitHubCommit} from "../src/lambda/provider/github";
import {CodebergCommit, getCBCommit} from "../src/lambda/provider/codeberg";

import {CommitActivity} from "../src/lambda/commit/commit";
import {loadCommits, saveCommits} from "../src/lambda/s3";
import {getGitHubToken, getCodebergToken} from "../src/lambda/secrets";

vi.mock("../src/lambda/s3", () => ({
    loadCommits: vi.fn(),
    saveCommits: vi.fn()
}));

vi.mock("../src/lambda/secrets", () => ({
    getGitHubToken: vi.fn(),
    getCodebergToken: vi.fn(),
}));

vi.mock("../src/lambda/provider/github", () => ({
    getGHCommit: vi.fn(),
}));
vi.mock("../src/lambda/provider/codeberg", () => ({
    getCBCommit: vi.fn(),
}));

beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv(
        "COMMIT_BUCKET",
        "fake-test-bucket"
    );
    vi.mocked(loadCommits).mockResolvedValue({
        commits: {
            commits: [],
            generatedAt: "2026-08-25T00:00:00.000Z"
        },
        etag: '"fake-etag"'
    });
    vi.mocked(saveCommits).mockResolvedValue(undefined);
    vi.stubEnv(
        "GITHUB_SECRET",
        "fake-test-git"
    );
    vi.stubEnv(
        "CODEBERG_SECRET",
        "fake-test-codeberg"
    );
    vi.mocked(getGitHubToken).mockResolvedValue("fake-github-token");
    vi.mocked(getCodebergToken).mockResolvedValue("fake-codeberg-token");
});

afterEach(() => {
    vi.unstubAllEnvs();
})

describe("handler", () => {
    // Call getGHCommit when payload.provider === "GitHub".
    it("calls getGHCommit for a payload provider of GitHub", async () => {
        const payload: CommitPayload = {
            provider: "GitHub",
            repo: "test-github",
            sha: "abc123github",
        } as const;

        await expect(handler(payload)).rejects.toThrow();

        // Assertions
        expect(getGHCommit, "getGHCommit was not called.").toHaveBeenCalled();
        expect(getGHCommit, "getGHCommit was not called with payload.").toHaveBeenCalledWith(payload, "fake-github-token");
        // Negative assertions
        expect(getCBCommit).not.toHaveBeenCalled();
    });

    // Call getCBCommit when payload.provider === "Codeberg"
    it("calls getCBCommit for a payload provider of Codeberg", async () => {
        const payload: CommitPayload = {
            provider: "Codeberg",
            repo: "test-codeberg",
            sha: "def456codeberg",
        } as const;

        await expect(handler(payload)).rejects.toThrow();

        // Assertions
        expect(getCBCommit).toHaveBeenCalled();
        expect(getCBCommit).toHaveBeenCalledWith(payload, "fake-codeberg-token");
        // Negative assertions
        expect(getGHCommit).not.toHaveBeenCalled();
    });
})

describe("getFileLanguage", () => {
    it("returns C++ when given .hpp or .cpp", () => {
        const hpp: string = ".hpp";
        const cpp: string = ".cpp";
        expect(getFileLanguage(hpp)).toBe("C++");
        expect(getFileLanguage(cpp)).toBe("C++");
    });

    it("returns TypeScript when given extension ends with .ts", () => {
        const ts: string = ".ts";
        const test_ts: string = ".test.ts";
        const config_ts: string = ".config.ts";
        const tsx: string = ".tsx";
        expect(getFileLanguage(ts)).toBe("TypeScript");
        expect(getFileLanguage(test_ts)).toBe("TypeScript");
        expect(getFileLanguage(config_ts)).toBe("TypeScript");
        expect(getFileLanguage(tsx)).toBe("TypeScript");
    });

    it("returns null when given a non-supported extension", () => {
        const txt: string = ".txt";
        const md: string = ".md";
        const empty: string = "";
        const rust: string = ".rs";
        expect(getFileLanguage(txt)).toBe(null);
        expect(getFileLanguage(md)).toBe(null);
        expect(getFileLanguage(empty)).toBe(null);
        expect(getFileLanguage(rust)).toBe(null);
    });
})

describe("normalizeLanguageStatistics", () => {
    it("combines same languages into one entry (.cpp and .hpp test)", () => {
        const files: CommitFile[] = [
            {
                filename: "file1.cpp",
                additions: 100,
                deletions: 100,
                changes: 200,
            },
            {
                filename: "file2.hpp",
                additions: 100,
                deletions: 10,
                changes: 110,
            },
            {
                filename: "file3.cpp",
                additions: 50,
                deletions: 2,
                changes: 52,
            },
        ];
        expect(normalizeLanguageStatistics(files)).toEqual<NormalizedLanguageStats>({
            stats:
                {
                    "C++": {
                        additions: 250,
                        deletions: 112,
                        changes: 362,
                    },
                },
            totals:
                {
                    additions: 250,
                    deletions: 112,
                    changes: 362,
                }
        })
    });

    it("collects different languages into respective entries (.cpp, .c, .html, .css, .ts)", () => {
        const files: CommitFile[] = [
            {
                filename: "file1.cpp",
                additions: 20,
                deletions: 2,
                changes: 22,
            },
            {
                filename: "file2.c",
                additions: 22,
                deletions: 73,
                changes: 95,
            },
            {
                filename: "file3.html",
                additions: 50,
                deletions: 80,
                changes: 130,
            },
            {
                filename: "file4.css",
                additions: 35,
                deletions: 20,
                changes: 55,
            },
            {
                filename: "file5.ts",
                additions: 30,
                deletions: 70,
                changes: 100,
            },
        ];
        expect(normalizeLanguageStatistics(files)).toEqual<NormalizedLanguageStats>(
            {
                stats:
                    {
                        "C++":
                            {
                                additions: 20,
                                deletions: 2,
                                changes: 22,
                            },
                        "C":
                            {
                                additions: 22,
                                deletions: 73,
                                changes: 95,
                            },
                        "HTML/CSS":
                            {
                                additions: 85,
                                deletions: 100,
                                changes: 185,
                            },
                        "TypeScript":
                            {
                                additions: 30,
                                deletions: 70,
                                changes: 100,
                            },
                    },
                totals:
                    {
                        additions: 157,
                        deletions: 245,
                        changes: 402,
                    }
            }
        );
    });
    it("does not add invalid files to totals", () => {
        const files: CommitFile[] = [
            {
                filename: "file1.cpp",
                additions: 100,
                deletions: 200,
                changes: 300,
            },
            {
                filename: "file2.txt",
                additions: 200,
                deletions: 100,
                changes: 300,
            },
            {
                filename: "file3.tsx",
                additions: 50,
                deletions: 50,
                changes: 100,
            },
            {
                filename: "file4.md",
                additions: 150,
                deletions: 0,
                changes: 150,
            },
            {
                filename: "file5",
                additions: 50,
                deletions: 0,
                changes: 50,
            },
        ];
        expect(normalizeLanguageStatistics(files)).toEqual(
            {
                stats:
                    {
                        "C++":
                            {
                                additions: 100,
                                deletions: 200,
                                changes: 300,
                            },
                        "TypeScript":
                            {
                                additions: 50,
                                deletions: 50,
                                changes: 100,
                            },
                    },
                totals:
                    {
                        additions: 150,
                        deletions: 250,
                        changes: 400,
                    },
            }
        );
    });
})

describe("normalizeCommit", () => {
    it("converts a GitHubCommit into a CommitActivity", () => {
        const fakeGHCommit: GitHubCommit = {
            sha: "abc123",
            html_url: "https://github.com/...",
            url: "https://api.github.com/...",
            repo: "test-github",
            commit: {
                message: "test commit",
                author: {
                    name: "Dakota",
                    date: "2026-08-25T00:00:00Z",
                },
            },
        };
        const fakePayload: CommitPayload = {
            provider: "GitHub",
            repo: "test-github",
            sha: "abc123",
        }
        const fakeLanguageStats: NormalizedLanguageStats = {
            stats: {
                "C++": {
                    additions: 100,
                    deletions: 20,
                    changes: 120,
                },
            },
            totals: {
                additions: 100,
                deletions: 20,
                changes: 120,
            },
        };
        expect(normalizeCommit(fakeGHCommit, fakePayload, fakeLanguageStats)).toEqual<CommitActivity>(
            {
                provider: "GitHub",
                repo: "test-github",
                sha: "abc123",
                message: "test commit",
                authoredAt: "2026-08-25T00:00:00Z",
                url: "https://github.com/...",
                languageStats: fakeLanguageStats,
            }
        )
    });

    it("fails when given a payload provider of 'GitHub' but recieves a CodebergCommit commit", () => {
        const fakeCBCommit: CodebergCommit = {
            sha: "abc123",
            html_url: "https://codeberg.org/...",
            url: "https://codeberg.org/api/v1/...",
            commit:
                {
                    message: "test commit",
                },
            created: "2026-08-25T00:00:00Z",
            repo: "test-codeberg",
        };
        const fakePayload: CommitPayload = {
            provider: "GitHub",
            repo: "test-codeberg",
            sha: "abc123",
        };
        const fakeLanguageStats: NormalizedLanguageStats = {
            stats: {
                "C++": {
                    additions: 100,
                    deletions: 20,
                    changes: 120,
                },
            },
            totals: {
                additions: 100,
                deletions: 20,
                changes: 120,
            },
        };
        expect(normalizeCommit(fakeCBCommit, fakePayload, fakeLanguageStats)).toBeNull();
    });

    it("fails when given a payload provider of 'Codeberg' but recieves a GitHubCommit commit", () => {
        const fakeGHCommit: GitHubCommit = {
            sha: "abc123",
            html_url: "https://github.com/...",
            url: "https://api.github.com/...",
            repo: "test-github",
            commit: {
                message: "test commit",
                author: {
                    name: "Dakota",
                    date: "2026-08-25T00:00:00Z",
                },
            },
        };
        const fakePayload: CommitPayload = {
            provider: "Codeberg",
            repo: "test-codeberg",
            sha: "abc123",
        };
        const fakeLanguageStats: NormalizedLanguageStats = {
            stats: {
                "C++": {
                    additions: 100,
                    deletions: 20,
                    changes: 120,
                },
            },
            totals: {
                additions: 100,
                deletions: 20,
                changes: 120,
            },
        };
        expect(normalizeCommit(fakeGHCommit, fakePayload, fakeLanguageStats)).toBeNull();
    });
    it("converts to CommitActivity even if NormalizedLanguageStatistics is null", () => {
        const fakeGHCommit: GitHubCommit = {
            sha: "abc123",
            html_url: "https://github.com/...",
            url: "https://api.github.com/...",
            repo: "test-github",
            commit: {
                message: "test commit",
                author: {
                    name: "Dakota",
                    date: "2026-08-25T00:00:00Z",
                },
            },
        };
        const fakePayload: CommitPayload = {
            provider: "GitHub",
            repo: "test-github",
            sha: "abc123",
        }
        const fakeLanguageStats: NormalizedLanguageStats | undefined = undefined;

        expect(normalizeCommit(fakeGHCommit, fakePayload, fakeLanguageStats)).toEqual<CommitActivity>(
            {
                provider: "GitHub",
                repo: "test-github",
                sha: "abc123",
                message: "test commit",
                authoredAt: "2026-08-25T00:00:00Z",
                url: "https://github.com/...",
                languageStats: undefined,
            }
        )
    });
})