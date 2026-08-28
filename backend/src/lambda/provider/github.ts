import {CommitPayload, CommitFile, freshCommitCheck} from "../handler.js";

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

export function normalizeGHCommit(commit: GitHubCommit): [string, string, string] {
    return [commit.commit.message, commit.commit.author.date, commit.html_url];
}