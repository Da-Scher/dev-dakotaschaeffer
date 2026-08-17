import * as fs from "node:fs";
import {loadEnvFile} from "node:process";

loadEnvFile(".env");
if (process.env.GITHUB_TOKEN === undefined || process.env.GITHUB_TOKEN === "ADD_GITHUB_TOKEN") throw new Error("GITHUB_TOKEN not defined. Did you add .env with your actual tokens?");

export interface LanguageStats {
    language: string;
    additions: number;
    deletions: number;
}

export interface GitHubRepository {
    name: string;
    html_url: string;
    pushed_at: string;
}

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
    patch: string;
    status: "added" | "modified" | "removed" | "renamed";
}

export interface CommitActivity {
    provider: "github" | "gitlab" | "codeberg";
    repo: string;
    sha: string;
    message: string;
    authoredAt: string;
    url: string;
    languageStats: {
        stats: LanguageStats[];
        totals: {
            additions: number;
            deletions: number;
            total: number;
        };
    };
}

export interface CommitActivityResponse {
    generatedAt: string;
    commits: CommitActivity[];
}

const MS_IN_DAY: number = 24  * 60 * 60 * 1000;
const TIME_RANGE: number = 364 * MS_IN_DAY;

const GITHUB_HEADERS: HeadersInit = { "Accept": "application/vnd.github+json", "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28" };

export async function commitsJsonExists(): Promise<boolean> {
    try {
        await fs.promises.access("../public/data/commits.json", fs.constants.F_OK);
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

    const response: Response = await fetch(
        "https://api.github.com/users/Da-Scher/repos",
        {
            headers: GITHUB_HEADERS,
        });
    if (!response.ok) {
        throw new Error(
            `Failed to fetch GitHub repos: ${response.statusText}`
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

export function getGitHubLanguageStatistics(files: GitHubCommitFile[]): LanguageStats[] {
    const langStats: LanguageStats[] = [];
    const language = (fe: string): string | null => {
        if (fe.match(/^\.(ts|tsx|test.ts|config.ts)$/)) {
            return "typescript;"
        }
        else if (fe.match(/^\.(js|jsx|test.js|config.js)$/)) {
            return "javascript";
        }
        else if (fe.match(/^\.(css|html)$/)) {
            return "html/css";
        }
        else if (fe.match(/^\.(c|h)$/)) {
            return "c";
        }
        else if (fe.match(/^\.(cpp|hpp)$/)) {
            return "c++";
        }
        else if (fe.match(/^\.gds$/)) {
            return "godot script";
        }
        else if (fe.match(/^\.py$/)) {
            return "python";
        }
        // in any other case, return null.
        return null;
    }
    for (const file of files) {
        const fileExtension: RegExpMatchArray | null = file.filename.match(/\..+$/)
        if (fileExtension === null) {
            console.warn(`Could not get a file extension from ${file.filename}. Text file?`);
        }
        else {
            const lang: string | null = language(fileExtension[0]);
            if (lang === null) {
                console.warn(`Could not get a file extension from ${file.filename}. Unsupported language extension?`);
            }
            else {
                langStats.push({language: lang, additions: file.additions, deletions: file.deletions})
            }
        }
    }
    return langStats;
}

export async function fetchGitHubCommits(generatedAt: string | null, repoList: string[]): Promise<GitHubCommit[]> {
        const commitsGitHub: GitHubCommit[] = []
        for await (const repo of repoList) {
            const url: string = `https://api.github.com/repos/Da-Scher/${repo}/commits`;
            //console.log(url);
            const response: Response = await fetch(
                url,
                {
                    headers: GITHUB_HEADERS,
                });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch GitHub commits for repo ${repo}: `+
                    `Status: ${response.status} :: StatusText: ${response.statusText}`
                );
            }
            const responseData = (await response.json()) as GitHubCommit;
            if (!Array.isArray(responseData)) {
                throw new Error(
                    `Expected an array of GitHubCommit items for repo ${repo}`
                );
            }
            const commits: GitHubCommit[] =
                responseData
                    .filter((item: GitHubCommit) => { return commitFresh(generatedAt, item)} );
            //console.log(commits.length);
            for (const commit of commits) {
                //console.log(`working on ${commit.url}`);
                const start: number = performance.now();
                const commitResponse: Response = await fetch(commit.url, {headers: GITHUB_HEADERS});
                console.log(`${performance.now() - start}: Retrieved commit: ${commit.sha}`);
                if (!commitResponse.ok) {
                    throw new Error(`${performance.now() - start}: Failed to fetch GitHub commit details for repo ${repo}: ${commit.sha}`);
                }
                const commitData: GitHubCommit = await commitResponse.json();
                const commitSha: string = commitData.sha;
                const commitAuthorDate: string | undefined = commitData.commit.author?.date;
                //console.log(commitData);
                if (commitSha === undefined) {
                    throw new Error(
                        `${performance.now() - start}: Failed to parse sha from commit in ${url}`
                    );
                }
                if (!commitSha) {
                    console.warn(`${performance.now() - start}: Dropping commit with no sha from repo ${repo}`);
                    continue;
                }
                if (!commitAuthorDate) {
                    console.warn(`${performance.now() - start}: Dropping commit ${commitSha} with no author date`);
                    continue;
                }
                const commitAuthorDateMS: number = Date.parse(commitAuthorDate);
                if (Number.isNaN(commitAuthorDateMS) || commitAuthorDateMS < 0) {
                    console.warn(`${performance.now() - start}: Dropping commit ${commitSha} with invalid date: ` +
                    `${commitAuthorDateMS}`);
                    continue;
                }
                if(commitData.files?.length === 0) {
                    console.warn(`${performance.now() - start}: could not retrieve file information from commit ${commitSha}`)
                }

                commitsGitHub.push(
                    {
                        ...commitData,
                        repo
                    }
                );
                console.log(`${performance.now() - start}: Done with a commit.`);
                setTimeout(() => {}, 1000);
            }
        }
        return commitsGitHub;
}

export interface NormalizeCommitsOptions {
    commitsGitHub?: GitHubCommit[];
    commitsGitLab?: undefined;
    commitsCodeberg?: undefined;
}

export function normalizeCommits({commitsGitHub = undefined, commitsGitLab = undefined, commitsCodeberg = undefined}: NormalizeCommitsOptions): CommitActivityResponse {
    const caList: CommitActivity[] = [];
    for (const commit of commitsGitHub? commitsGitHub : []) {
        const provider = "github" as const;

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
        //console.log(commit.files);
        const languageStats: {
            stats: LanguageStats[],
            totals: { additions: number, deletions: number, total: number }
        } = {
            stats: [],
            totals: {
                additions: 0,
                deletions: 0,
                total: 0
            }
        }
        if (commit.files) {
            const stats: LanguageStats[] = getGitHubLanguageStatistics(commit.files);
            languageStats.stats = stats;
            languageStats.totals = {
                        additions:
                            stats.map(stat => stat.additions)
                                .reduce((accumulator: number, current: number): number => accumulator + current, 0),
                        deletions:
                            stats.map(stat => stat.deletions)
                                .reduce((accumulator: number, current: number): number => accumulator + current, 0),
                        total:
                            stats.map(stat => stat.additions)
                                .reduce((accumulator: number, current: number): number => accumulator + current, 0)
                            +
                            stats.map(stat => stat.deletions)
                                .reduce((accumulator: number, current: number): number => accumulator + current, 0),
                    }
                }
        caList.push({
            provider: provider,
            repo: repo,
            sha: sha,
            message: message,
            authoredAt: authoredAt,
            url: url,
            languageStats: languageStats,
        })
    }
    return {
        generatedAt: new Date().toISOString(),
        commits: caList,
    }
}

export async function getNormalizedData(): Promise<boolean> {
    const timerStart: DOMHighResTimeStamp = performance.now();
    let generatedAt: string | null = null;
    // check if file at '../public/data/commits.js exists
    // create file if it does not.
    if(!await commitsJsonExists()) {
        console.log("../public/data/commits.json does not exist.");
    }
    else {
        const fc: string = await fs.promises.readFile("../public/data/commits.json", "utf8");
        const commitsJson: CommitActivityResponse = JSON.parse(fc);
        if (commitsJson.generatedAt) {
            console.log(commitsJson.generatedAt);
            generatedAt = commitsJson.generatedAt;
        }
        else {
            console.error(`Failed to parse generatedAt from commits.json.`);
        }
    }

    // get GitHub repositories.
    const ghRepos: string[] = await fetchGitHubRepos(generatedAt).catch(
        (error) => {
            console.error(`getNormalizedData()::fetchGitHubRepos() Error: ${error.message}`);
            return [];
        }
    );
    // dev only
    //const ghRepos: string[] = ["dev-dakotaschaeffer"];
    if (ghRepos.length === 0) {
        console.error("No GitHub repos found.");
        return false;
    }
    const timerGHRepos: DOMHighResTimeStamp = performance.now() - timerStart;

    console.log(`Duration to get GitHub repos: ${timerGHRepos.toFixed(2)} ms`);
    const ghCommits: GitHubCommit[] = await fetchGitHubCommits(generatedAt, ghRepos).catch((error) => {
        console.error(`getNormalizedData()::fetchGitHubCommits() Error: ${error.message}`);
        return [];
    });
    if (ghCommits.length === 0) {
        console.error("No GitHub commits found.");
        return false;
    }
    const timerGHCommits: DOMHighResTimeStamp = performance.now() - timerStart;
    console.log(`Duration to get ${ghCommits.length} GitHub commits: ${timerGHCommits.toFixed(2)} ms`);
    const normalizedCommits: CommitActivityResponse = normalizeCommits({commitsGitHub: ghCommits});
    const timerNormalizedCommits: DOMHighResTimeStamp = performance.now() - timerStart;
    console.log(`Duration to have normalized commits: ${timerNormalizedCommits.toFixed(2)} ms`);
    await fs.promises.writeFile("../public/data/commits.json", JSON.stringify(normalizedCommits, null, 2), "utf8");
    return false;
}

getNormalizedData();
