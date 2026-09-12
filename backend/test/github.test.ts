import {describe, expect, it, Mock, vi} from "vitest";

import {getGHCommit, getGHReadme, GitHubCommit} from "../src/lambda/provider/github";
import {ReadmeData} from "../src/local";

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

describe("getGHReadme", async () => {
    it("returns a ReadmeData object if successful", async () => {
        const fakeObject: unknown = {
            contents: Buffer.from(`test-github repo created ${new Date().toISOString()}`).toString('base64'),
            size: Buffer.from(`test-github repo created ${new Date().toISOString()}`).toString('base64').length,
            repo: "test-github",
            encoding: "base64",
        };
        const mockFetch: Mock<Procedure> = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => fakeObject,
        });
        const expected: unknown = {
            repo: "test-github",
            content: Buffer.from(fakeObject.contents, fakeObject.encoding).toString('utf8'),
        };
        const result: ReadmeData | null = await getGHReadme("test-github", "fake token", mockFetch);
        expect(result).not.toBeNull();
        expect(result).toEqual(expected);
    });

    it("returns null if unsuccessful", async () => {
        const fakeObject: unknown = {
            contents: Buffer.from(`test-github repo created ${new Date().toISOString()}`).toString('base64'),
            size: Buffer.from(`test-github repo created ${new Date().toISOString()}`).toString('base64').length,
            repo: "test-github",
            encoding: "base64",
        };
        const mockFetch: Mock<Procedure> = vi.fn().mockResolvedValue({
            ok: false,
            json: async () => fakeObject,
        });
        const result: ReadmeData | null = await getGHReadme("test-github", "fake token", mockFetch);
        expect(result).toBeNull();
    });
})