import {describe, expect, it, Mock, vi} from "vitest";

import {getGHCommit, GitHubCommit} from "../src/lambda/provider/github";

describe("getGHCommit", async () => {
    it("retrieves the requested commit GitHub commit", async () => {
        const fakeCommit: GitHubCommit = {
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
            }
        };

        const mockFetch: Mock<Procedure> = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => fakeCommit,
        });

        const result = await getGHCommit(
            {
                provider: "GitHub",
                repo: "test-github",
                sha: "abc123",
            },
            "fake-token",
            mockFetch as unknown as typeof fetch
        );

        expect(result).toEqual(fakeCommit);
    })
})