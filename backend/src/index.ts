import * as fs from "node:fs";

export interface GitHubRepository {
    name: string;
    html_url: string;
    pushed_at: string;
}

export interface GitHubCommit {
    sha: string;
    html_url: string;
    repo: string;
    commit: {
        message: string;
        author: {
            name: string;
            date: string;
        } | null;

        committer: {
            name: string;
            date: string;
        } | null;
    }

    files?: GitHubCommitFile[];
}

export interface GitHubCommitFile {
    filename: string;
    additions: number;
    deletions: number;
    changes: number;
    status: "added" | "modified" | "removed" | "renamed";
}

export interface CommitActivity {
    provider: "github" | "gitlab" | "codeberg";
    repo: string;
    sha: string;
    message: string;
    authoredAt: string;
    url: string;
}

export interface CommitActivityResponse {
    generatedAt: string;
    commits: CommitActivity[];
}

const MS_IN_DAY: number = 24 * 60 * 60 * 1000;
const TIME_RANGE: number = 364 * MS_IN_DAY;

export async function commitsJsonExists(): Promise<boolean> {
    try {
        await fs.promises.access("../../public/data/commits.json", fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

export function repoFresh(generatedAt: string | null, repo: GitHubRepository): boolean{
    const cachedDate: Date | null = generatedAt === null ? null : new Date(generatedAt);
    const currentDate: Date = new Date();
    const pushedAt: Date = new Date(repo.pushed_at);
    if (!cachedDate) {
        // returns true iff current time - pushed time is less than 1 years worth of ms.
        return currentDate.getTime() - pushedAt.getTime() <= TIME_RANGE;
    }
    else {
        // returns true iff current time - pushed time is less than 1 years worth of ms,
        // AND pushed time is greater than CommitActivityResponse.generatedAt
        return currentDate.getTime() - pushedAt.getTime() <= TIME_RANGE
            && pushedAt.getTime() >= cachedDate.getTime();
    }
}

export async function fetchGitHubRepos(generatedAt: string | null): Promise<string[]> {

    const response: Response = await fetch("https://api.github.com/users/Da-Scher/repos");
    if (!response.ok) {
        throw new Error(
            `Failed to GitHub GitHub repos: ${response.statusText}`
        )
    }
    const json: GitHubRepository[] = await response.json();

    return json
        .filter((item: GitHubRepository): boolean => { return repoFresh(generatedAt, item)})
        .map((item: GitHubRepository): string => { return item.name })
}

export function commitFresh(generatedAt: string | null, commit: GitHubCommit): boolean {
    const cachedDate: Date | null = generatedAt === null ? null : new Date(generatedAt);
    const currentDate: Date = new Date();
    const author: {name: string, date: string} | null = commit.commit.author;
    if (author === null) {
        console.warn(`Could not parse author.`);
        return false;
    }
    else {
        if (!author.date) {
            console.warn(`Could not parse author.date.`);
            return false;
        }
    }
    const authorDate: Date = new Date(author.date);
    if (cachedDate === null) {
        return currentDate.getTime() - authorDate.getTime() <= TIME_RANGE;
    } else {
        return currentDate.getTime() - authorDate.getTime() <= TIME_RANGE &&
            authorDate.getTime() >= cachedDate.getTime();
    }
}

export async function fetchGitHubCommits(generatedAt: string | null, repoList: string[]): Promise<GitHubCommit[]> {
        const commitsGitHub: GitHubCommit[] = []
        for await (const repo of repoList) {
            const url: string = `https://api.github.com/repos/Da-Scher/${repo}/commits`;
            const response: Response = await fetch(
                url,
                {
                    headers:
                        {
                            "content-type": "application/vnd.github+json",
                        },
                });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch GitHub commits for repo ${repo}: `+
                    `Status: ${response.status} :: StatusText: ${response.statusText}`
                );
            }
            const json = (await response.json()) as GitHubCommit;
            if (!Array.isArray(json)) {
                throw new Error(
                    `Expected an array of GitHubCommit items for repo ${repo}`
                );
            }

            for (const commit of json) {
                const commitSha: string = commit.sha;
                const commitAuthorDate: string = commit.commit.author?.date;
                if (commitSha === undefined) {
                    throw new Error(
                        `Failed to parse sha from commit in ${url}`
                    );
                }
                if (!commitSha) {
                    console.warn(`Dropping commit with no sha from repo ${repo}`);
                    continue;
                }
                if (!commitAuthorDate) {
                    console.warn(`Dropping commit ${commitSha} with no author date`);
                    continue;
                }
                const commitAuthorDateMS: number = Date.parse(commitAuthorDate);
                if (Number.isNaN(commitAuthorDateMS) || commitAuthorDateMS < 0) {
                    console.warn(`Dropping commit ${commitSha} with invalid date: ` +
                    `${commitAuthorDateMS}`);
                    continue;
                }
                if (commitFresh(generatedAt, commit)) {
                    //console.log(`time difference: ${now - new Date(authorDate).getTime()}`);
                    commitsGitHub.push(
                        {
                            ...commit,
                            repo
                        }
                    );
                }
            }
        }
        return commitsGitHub;
}

export interface NormalizeCommitsOptions {
    commitsGitHub?: GitHubCommit[];
    commitsGitLab?: unknown;
    commitsCodeberg?: unknown;
}

export function normalizeCommits(commitsList: GitHubCommit[]): CommitActivityResponse {
    const caList: CommitActivity[] = [];
    for (const commit of commitsList) {
        const provider: "github" | "gitlab" | "codeberg" =
        commit.html_url.includes("github") ? "github"
        : commit.html_url.includes("gitlab") ? "gitlab"
        : "codeberg"

        const repo: string = commit.repo;
        const sha: string = commit.sha;
        const message: string = commit.commit.message;
        const author: {name: string, date: string} | null = commit.commit.author;
        if(author === null) {
            console.error(`had to drop commit`)
            continue;
        }
        const authoredAt: string = author.date;
        const url: string = commit.html_url;

        caList.push({
            provider: provider,
            repo: repo,
            sha: sha,
            message: message,
            authoredAt: authoredAt,
            url: url,
        })
    }
    return {
        generatedAt: new Date().toISOString(),
        commits: caList,
    }
}

export async function getNormalizedData(): Promise<boolean> {
    const timerStart: DOMHighResTimeStamp = performance.now();
    let generatedAt: string | null = "";
    // check if file at '../public/data/commits.js exists
    // create file if it does not.
    if(!await commitsJsonExists()) {
        //console.log("../public/data/commits.json does not exist.");
        await fs.promises.writeFile("../../public/data/commits.json", "{}", "utf8");
    }
    else {
        const fc: string = await fs.promises.readFile("../../public/data/commits.json", "utf8");
        const commitsJson: CommitActivityResponse = JSON.parse(fc);
        if (commitsJson.generatedAt) {
            generatedAt = commitsJson.generatedAt;
        }
        else {
            console.error(`Failed to parse generatedAt from commits.json.`);
            generatedAt = null;
        }
    }

    // get GitHub repositories.
    const ghRepos: string[] = await fetchGitHubRepos(generatedAt).catch(
        (error) => {
            console.error(`getNormalizedData()::fetchGitHubRepos() Error: ${error.message}`);
            return [];
        }
    );
    if (!ghRepos.length) {
        return false;
    }
    const timerGHRepos: DOMHighResTimeStamp = performance.now() - timerStart;

    console.log(`Duration to get GitHub repos: ${timerGHRepos.toFixed(2)} ms`);
    const ghCommits: GitHubCommit[] = await fetchGitHubCommits(generatedAt, ghRepos).catch((error) => {
        console.error(`getNormalizedData()::fetchGitHubCommits() Error: ${error.message}`);
        return [];
    });
    if (!ghCommits.length) {
        return false;
    }
    const timerGHCommits: DOMHighResTimeStamp = performance.now() - timerStart;
    console.log(`Duration to get ${ghCommits.length} GitHub commits: ${timerGHCommits.toFixed(2)} ms`);
    const normalizedCommits: CommitActivityResponse = normalizeCommits(ghCommits);
    const timerNormalizedCommits: DOMHighResTimeStamp = performance.now() - timerStart;
    console.log(`Duration to have normalized commits: ${timerNormalizedCommits.toFixed(2)} ms`);
    await fs.promises.writeFile("../../public/data/commits.json", JSON.stringify(normalizedCommits), "utf8");
    return false;
}

getNormalizedData();
