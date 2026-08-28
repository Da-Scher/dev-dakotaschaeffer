import {describe, expect, it, Mock, vi} from "vitest";

import {getCBCommit, CodebergCommit, getCBPatch, getFilesFromPatch} from "../src/lambda/provider/codeberg";

describe("getCBCommit", async () => {
    it("retrieves the requested CodebergCommit commit", async () => {
        const fakeCommit: CodebergCommit = {
            sha: "abc123",
            html_url: "https://codeberg.org/...",
            url: "https://codeberg.org/api/v1/...",
            commit: {
                message: "test commit",
            },
            created: "2026-08-25T00:00:00Z",
            repo: "test-codeberg",
        };

        const mockFetch: Mock<Procedure> = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => fakeCommit,
        })

        const result: CodebergCommit | null = await getCBCommit(
            {
                provider: "Codeberg",
                repo: "test-codeberg",
                sha: "abc123",
            },
            "fake-token",
            mockFetch as unknown as typeof fetch
        );

        expect(result).toEqual(fakeCommit);
    });
})

describe("getCBPatch", async () => {
    it("retrieves the requested patch file", async () => {
        const fakePatch: string = "test patch";
        const mockFetch: Mock<Procedure> = vi.fn().mockResolvedValue({
            ok: true,
            text: async () => fakePatch,
        });

        const result: string | null = await getCBPatch(
            {
                provider: "Codeberg",
                repo: "test-codeberg",
                sha: "abc123",
            },
            "fake-token",
            mockFetch as unknown as typeof fetch
        );
        expect(result).toBe("test patch");
    });
})

describe("getFilesFromPatch", () => {
    it("creates a CommitFile array from patch", () => {
        const fakePatch: string =
            "diff --git a/src/main.js b/src/main.js\n" +
            "index e69de29..d95f3ad 100644\n" +
            "--- a/src/main.js\n" +
            "+++ b/src/main.js\n" +
            "@@ -1,3 +1,4 @@\n" +
            " const init = () => {\n" +
            "-  console.log(\"Starting...\");\n" +
            "+  console.log(\"Application started successfully.\");\n" +
            "+  setupListeners();\n" +
            " };";
        expect(getFilesFromPatch(fakePatch)).toEqual(
            [
                {
                    filename: "src/main.js",
                    additions: 2,
                    deletions: 1,
                    changes: 3,
                }
            ]
        );
    });
    it("ignores file deletion (+++ /dev/null)", () => {
        const fakePatch: string =
            "diff --git a/public/index.html b/public/index.html\n" +
            "deleted file mode 100644\n" +
            "index d2394fa..0000000\n" +
            "--- a/public/index.html\n" +
            "+++ /dev/null\n" +
            "@@ -1,7 +0,0|\n" +
            "-<!DOCTYPE html>\n" +
            "-<html>\n" +
            "-<head><title>Legacy App</title></head>\n" +
            "-<body>\n" +
            "-  <h1>This old file is being removed by the patch</h1>\n" +
            "-</body>\n" +
            "-</html>";
        expect(getFilesFromPatch(fakePatch)).toEqual([]);
    });

    it("adds multiple files to CommitFiles array", () => {
        const fakePatch: string =
            "diff --git a/src/app.js b/src/app.js\n" +
            "index 8f3b2a1..c4d2e9b 100644\n" +
            "--- a/src/app.js\n" +
            "+++ b/src/app.js\n" +
            "@@ -4,8 +4,14 @@ const initializeApp = () => {\n" +
            "   console.log(\"Loading dashboard...\");\n" +
            "   \n" +
            "   try {\n" +
            "-    loadUserData();\n" +
            "-    renderWidgets();\n" +
            "+    const user = loadUserData();\n" +
            "+    if (user.isAuthenticated) {\n" +
            "+      renderWidgets();\n" +
            "+      logActivity(\"Dashboard rendered successfully\");\n" +
            "+    } else {\n" +
            "+      redirectToLogin();\n" +
            "+    }\n" +
            "   } catch (error) {\n" +
            "-    console.error(\"Failed to load dashboard:\", error);\n" +
            "+    console.error(\"Critical Failure:\", error.message);\n" +
            "+    showSystemAlert(\"Error code: 500\");\n" +
            "   }\n" +
            " };\n" +
            "diff --git a/public/index.html b/public/index.html\n" +
            "deleted file mode 100644\n" +
            "index d2394fa..0000000\n" +
            "--- a/public/index.html\n" +
            "+++ b/public/index.html\n" +
            "@@ -1,7 +0,0|\n" +
            "-<!DOCTYPE html>\n" +
            "-<html>\n" +
            "-<head><title>Legacy App</title></head>\n" +
            "-<body>\n" +
            "-  <h1>This old file is being removed by the patch</h1>\n" +
            "-</body>\n" +
            "-</html>\n" +
            "diff --git a/docs/CHANGELOG.txt b/docs/CHANGELOG.txt\n" +
            "new file mode 100644\n" +
            "index 0000000..e7d1a2c\n" +
            "--- /dev/null\n" +
            "+++ b/docs/CHANGELOG.txt\n" +
            "@@ -0,0 +1,5 @@\n" +
            "+v2.0.0 Release Notes\n" +
            "+====================\n" +
            "+- Refactored core dashboard rendering logic in app.js\n" +
            "+- Added auth verification guard clause to init sequence\n" +
            "+- Deleted deprecated legacy index.html entry point\n";
        expect(getFilesFromPatch(fakePatch)).toEqual(
            [
                {
                    filename: "src/app.js",
                    additions: 9,
                    deletions: 3,
                    changes: 12,
                },
                {
                    filename: "public/index.html",
                    additions: 0,
                    deletions: 7,
                    changes: 7,
                },
                {
                    filename: "docs/CHANGELOG.txt",
                    additions: 5,
                    deletions: 0,
                    changes: 5,
                },
            ]
        );
    });
})