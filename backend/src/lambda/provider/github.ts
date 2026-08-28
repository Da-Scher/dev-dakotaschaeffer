import {CommitPayload, CommitFile} from "../handler.js";

export interface GitHubCommit {
    sha: string;
    html_url: string;
    url: string;
    repo: string;
    commit: {
        message: string;
        author: {
            name: string;
            date: string;
        };
    }

    files?: CommitFile[];
}



export async function getGHCommit(
    payload: CommitPayload,
    token: string,
    fetcher: typeof fetch = fetch
): Promise<GitHubCommit | null> {
    console.log(`Secret exists: ${token.length > 0}`);
    console.log(`token length: ${token.length}`);
    console.log(`token prefix: ${token.slice(0, 4)}`);
    const url: string = `https://api.github.com/repos/Da-Scher/${payload.repo}/commits/${payload.sha}`;
    console.log(`url: ${url}`);
    const response: Response = await fetcher(url, {
        headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        console.error(`Did not fetch GH commit: ${response.status}: ${url}`);
        return null;
    }

    return await response.json() as GitHubCommit;
}

export function normalizeGHCommit(commit: GitHubCommit): [string, string, string] {
    return [commit.commit.message, commit.commit.author.date, commit.html_url];
}