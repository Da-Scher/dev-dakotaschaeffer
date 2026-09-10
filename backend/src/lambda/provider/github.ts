import {CommitFile, CommitPayload, freshCommitCheck} from "../handler.js";
import type { ReadmeData } from "../commit/commit.js";

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
    const url: string = `https://api.github.com/repos/Da-Scher/${payload.repo}/commits/${payload.sha}`;
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

    // verify that the commit is not too old to continue
    const json: GitHubCommit = await response.json() as GitHubCommit;
    const commitDate: number = new Date(json.commit.author.date).getTime();

    if (!freshCommitCheck(commitDate)) {
        console.warn(`Commit is older than one year from midnight today.`);
        return null;
    }

    return json;
}

export async function getGHReadme(
    repo: string,
    token: string,
    fetcher: typeof fetch = fetch
): Promise<ReadmeData | null> {
    const response: Response = await fetcher(
        `https://api.github.com/repos/Da-Scher/${repo}/readme`,
        {
            headers: {
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                Authorization: `Bearer ${token}`,
            }
        }
    );
    if (!response.ok) {
        console.error(`Did not fetch GH readme readme from repo ${repo}`);
        return null;
    }
    const responseJson = await response.json();
    return {
        repo: repo,
        content: Buffer.from(responseJson.contents, responseJson.encoding).toString('utf8'),
    }
}

export function normalizeGHCommit(commit: GitHubCommit): [string, string, string] {
    return [commit.commit.message, commit.commit.author.date, commit.html_url];
}