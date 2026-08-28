import {S3Client} from "@aws-sdk/client-s3";

import {describe, expect, it, Mock, vi} from "vitest";

import {loadCommits, LoadedCommits} from "../src/lambda/s3";
import {CommitActivityResponse} from "../src/lambda/commit/commit";

describe("S3Client tests", async () => {
    it("loads commits.json from s3", async () => {
        const existingCommits: CommitActivityResponse = {
            generatedAt: "2026-08-25T00:00:00Z",
            commits: [
                {
                    provider: "GitHub",
                    repo: "test-github",
                    sha: "abc123",
                    message: "test commit",
                    authoredAt: "2026-08-24T00:00:00Z",
                    url: "https://github.com/...",
                    languageStats: undefined,
                },
                {
                    provider: "GitHub",
                    repo: "test-github",
                    sha: "abc123",
                    message: "test commit",
                    authoredAt: "2026-08-23T00:00:00Z",
                    url: "https://github.com/...",
                    languageStats: {
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
                    },
                },
                {
                    provider: "GitHub",
                    repo: "test-github",
                    sha: "abc123",
                    message: "test commit",
                    authoredAt: "2026-08-22T00:00:00Z",
                    url: "https://github.com/...",
                    languageStats: {
                        stats: {
                            "OCamel": {
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
                    }
                },
                {
                    provider: "Codeberg",
                    repo: "test-codeberg",
                    sha: "abc123",
                    message: "test commit",
                    authoredAt: "2026-08-21T00:00:00Z",
                    url: "https://codeberg.org/...",
                    languageStats: {
                        stats: {
                            "TypeScript": {
                                additions: 20,
                                deletions: 80,
                                changes: 100,
                            },
                        },
                        totals: {
                            additions: 20,
                            deletions: 80,
                            changes: 100,
                        },
                    }
                }
            ]
        };
        const send: Mock<Procedure> = vi.fn().mockResolvedValue({
            Body: {
                transformToString: vi.fn().mockResolvedValue(
                    JSON.stringify(existingCommits)
                )
            },
            ETag: '"etag-123"',
        });
        const mockS3 = {
            send
        } as unknown as S3Client;
        const result: LoadedCommits = await loadCommits(mockS3, "test-bucket", "commits.json");

        expect(result.commitActivityResponse).toEqual(existingCommits);

        expect(result.etag).toBe('"etag-123"');

        expect(send).toHaveBeenCalledOnce();
    });
})