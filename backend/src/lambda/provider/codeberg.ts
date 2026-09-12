import {CommitPayload, CommitFile, freshCommitCheck} from "../handler.js";
import {ReadmeData} from "../commit/commit.js";

export interface CodebergCommit {
    sha: string;
    html_url: string;
    url: string;
    commit: {message: string};
    created: string;
    repo: string;
}

export async function getCBCommit(
    payload: CommitPayload,
    token: string,
    fetcher: typeof fetch = fetch
): Promise<CodebergCommit | null> {
    const url: string = `https://codeberg.org/api/v1/repos/dascher/${payload.repo}/git/commits/${payload.sha}`;
    const response: Response = await fetcher(url, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            }
    });
    if (!response.ok) {
        return null;
    }
    // verify that the commit is not too old to continue
    const json: CodebergCommit = await response.json() as CodebergCommit;
    const commitDate: number = new Date(json.created).getTime();

    if (!freshCommitCheck(commitDate)) {
        console.warn(`Commit is older than 364 days from mightnight today in ms`);
        return null;
    }
    return json;
}

export async function getCBPatch(
    payload: CommitPayload,
    token: string,
    fetcher: typeof fetch = fetch
): Promise<string | null> {
    const url: string = `https://codeberg.org/api/v1/repos/dascher/${payload.repo}/git/commits/${payload.sha}.patch`;

    const response: Response = await fetcher(url, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        }
    });

    if (!response.ok) {
        console.error(`Did not fetch GH commit: ${response.status}: ${url}`);
        return null;
    }

    return await response.text() as string | null;
}

export function getFilesFromPatch(patch: string | null): CommitFile[] | undefined {
    if (!patch) return undefined;
    const files: CommitFile[] = [];
    const lines: string[] = patch.split('\n');
    let currentFile: CommitFile | null = null;
    for (const line of lines) {
        // Doing nothing with former file titles
        if (line.startsWith('---')) continue;
        else if (line.startsWith('+++ b/')) {
            if (currentFile) files.push(currentFile);
            currentFile = {
                filename: line.slice(6, line.length),
                additions: 0,
                deletions: 0,
                changes: 0,
            }
        }
        else if (currentFile && line.startsWith('+')) {
            currentFile.additions++;
            currentFile.changes++;
        }
        else if (currentFile && line.startsWith('-')) {
            currentFile.deletions++;
            currentFile.changes++;
        }
    }
    if(currentFile) files.push(currentFile);
    return files;
}

export async function getCBReadme(
    repo: string,
    token: string,
    fetcher: typeof fetch = fetch
): Promise<ReadmeData | null> {
    const response: Response = await fetcher(
        `https://codeberg.org/api/v1/repos/dascher/${repo}/contents/README.md`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        }
    });
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

export function normalizeCBCommit(commit: CodebergCommit): [string, string, string] {
    return [commit.commit.message, commit.created, commit.html_url];
}