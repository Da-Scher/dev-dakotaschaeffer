import * as fs from "node:fs";
import {loadEnvFile} from "node:process";

loadEnvFile(".env");
if (process.env.GITHUB_TOKEN === undefined || process.env.GITHUB_TOKEN === "ADD_GITHUB_TOKEN") throw new Error("GITHUB_TOKEN not defined. Did you add .env with your actual tokens?");

type ProgrammingLanguage =
    |   "C"
    |   "C++"
    |   "Haskell"
    |   "HTML/CSS"
    |   "GDScript"
    |   "Java"
    |   "JavaScript"
    |   "Lua"
    |   "OCamel"
    |   "Python"
    |   "Shell"
    |   "TypeScript"
    |   "Yaml"


export interface LanguageStat {
    additions: number;
    deletions: number;
    changes: number;
}

type LanguageStats = Partial<Record<ProgrammingLanguage, LanguageStat>>;

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

export interface NormalizedLanguageStats {
    stats: LanguageStats;
    totals: LanguageStat;
}

export interface CommitActivity {
    provider: "github" | "gitlab" | "codeberg";
    repo: string;
    sha: string;
    message: string;
    authoredAt: string;
    url: string;
    languageStats: NormalizedLanguageStats;
}

export interface CodebergRepository {
    name: string;
    html_url: string;
    updated_at: string;
}

export interface CodebergCommit {
    sha: string;
    html_url: string;
    url: string;
    commit: {message: string};
    created: string;
    repo: string;
}

export interface CommitActivityResponse {
    generatedAt: string;
    commits: CommitActivity[];
}

const MS_IN_DAY: number = 24  * 60 * 60 * 1000;
const TIME_RANGE: number = 364 * MS_IN_DAY;

const GITHUB_HEADERS: HeadersInit = { "Accept": "application/vnd.github+json", "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28" };
const CODEBERG_HEADERS: HeadersInit = { "Accept": "application/json", "Authorization": `Bearer ${process.env.CODEBERG_TOKEN}` };
export async function commitsJsonExists(): Promise<boolean> {
    try {
        await fs.promises.access("../public/data/commits.json", fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

export function repoFresh(generatedAt: string | null, repo: GitHubRepository | CodebergRepository): boolean{
    const cachedDate: Date | null = generatedAt === null ? null : new Date(generatedAt);
    const currentDate: Date = new Date();
    const pushedAt: Date =
        'pushed_at' in repo
            ? new Date(repo.pushed_at)
            : new Date(repo.updated_at);
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

export async function fetchCodebergRepos(generatedAt: string | null): Promise<string[]> {
    const response: Response = await fetch(
        "https://codeberg.org/api/v1/users/dascher/repos",
        {
            headers: CODEBERG_HEADERS,
        }
    )
    if (!response.ok) {
        throw new Error(
            `Failed to fetch codeberg repos: ${response.statusText}`
        )
    }
    const json: CodebergRepository[] = await response.json();

    return json
        .filter((item: CodebergRepository): boolean => { return repoFresh(generatedAt, item) })
        .map((item: CodebergRepository): string => { return item.name })
}

export function commitFresh(generatedAt: string | null, commit: GitHubCommit | CodebergCommit): boolean {
    const cachedDate: Date | null = generatedAt === null ? null : new Date(generatedAt);
    const currentDate: Date = new Date();
    // This check verifies that the commit is from GitHub.
    if ('commit' in commit && 'author' in commit.commit) {
        // Define author and check if its present.
        const author: { name: string, date: string } | null = commit.commit.author;
        if (author === null) {
            console.warn(`Could not parse author.`);
            return false;
        } else {
            // If author is present, check if date is present.
            if (!author.date) {
                console.warn(`Could not parse author.date.`);
                return false;
            }
        }
        // Create a Date object from author.date.
        const authorDate: Date = new Date(author.date);
        // Check if cachedDate from commits.json is defined.
        if (cachedDate === null) {
            // Simply ignore the cachedDate test.
            return currentDate.getTime() - authorDate.getTime() <= TIME_RANGE;
        } else {
            // Else add the cachedDate test.
            return currentDate.getTime() - authorDate.getTime() <= TIME_RANGE &&
                authorDate.getTime() >= cachedDate.getTime();
        }
    }
    // This check verifies that the commit is from Codeberg.
    // Does this satisfy checks for GitTea and other Forgejo APIs?
    else if ('created' in commit) {
        // Define created and check if it exists.
        const created: string | null = commit.created;
        if (created === null) {
            console.warn(`Could not parse created ISO date.`);
            return false;
        }
        // Create a Date object from created.
        const createdDate: Date = new Date(created);
        // cachedDate check same as before.
        if (cachedDate === null) {
            return currentDate.getTime() - createdDate.getTime() <= TIME_RANGE;
        } else {
            return currentDate.getTime() - createdDate.getTime() <= TIME_RANGE &&
                createdDate.getTime() >= cachedDate.getTime();
        }
    }
    // TODO: else if FROM GitLab.
    // break if both aren't the case.
    else {
        return false;
    }
}

export function getGitHubLanguageStatistics(files: GitHubCommitFile[]): LanguageStats {
    const langStats: LanguageStats = {};
    for (const file of files) {
        const fileExtension: RegExpMatchArray | null = file.filename.match(/\..+$/)
        if (fileExtension === null) {
            console.warn(`Could not get a file extension from ${file.filename}. Text file?`);
        }
        else {
            const lang: ProgrammingLanguage | null = getFileLanguage(fileExtension[0]);
            if (lang === null) {
                console.warn(`Could not get a file extension from ${file.filename}. Unsupported language extension?`);
            }
            else {
                langStats[lang] ??= {
                    additions: 0,
                    deletions: 0,
                    changes: 0,
                }
                const stats: LanguageStat | undefined = langStats[lang];
                if (stats !== undefined) {
                    stats.additions = file.additions;
                    stats.deletions = file.deletions;
                    stats.changes = file.changes;
                }
            }
        }
    }
    return langStats;
}

export function getFileLanguage(line: string): ProgrammingLanguage | null {
    if (line.match(/^\.(ts|tsx|test.ts|config.ts)$/)) {
        return "TypeScript"
    }
    else if (line.match(/^\.(js|jsx|test.js|config.js)$/)) {
        return "JavaScript";
    }
    else if (line.match(/^\.(css|html)$/)) {
        return "HTML/CSS";
    }
    else if (line.match(/^\.[ch]$/)) {
        return "C";
    }
    else if (line.match(/^\.(cpp|hpp)$/)) {
        return "C++";
    }
    else if (line.match(/^\.gds$/)) {
        return "GDScript";
    }
    else if (line.match(/^\.py$/)) {
        return "Python";
    }
    else if (line.match(/^\.sh$/)) {
        return "Shell";
    }
    // in any other case, return null.
    return null;
}

export async function getCodebergLanguageStatistics(repo: string, sha: string): Promise<LanguageStats | null> {
    const langStats: LanguageStats = {};
    const url: string = `https://codeberg.org/api/v1/repos/dascher/${repo}/git/commits/${sha}.patch`;
    const response: Response = await fetch(url, {headers: CODEBERG_HEADERS});
    if(!response.ok) {
        console.error(`Could not parse patch response from ${url}`);
        return null;
    }
    const data: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>> | undefined = response.body?.getReader();
    if (!data) {
        console.error(`Could not convert data to a ReadableStream`);
        return null;
    }
    const decoder = new TextDecoder('utf-8');
    let buffer: string = ""
    let currentLanguage: ProgrammingLanguage | null = null;

    try {
        while (true) {
            const { done, value } = await data.read();
            if (done) break;

            buffer += decoder.decode(value, {stream: true});
            let newlineIndex: number;

            while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
                let line = buffer.slice(0, newlineIndex);
                buffer = buffer.slice(newlineIndex + 1);
                if (line.endsWith("\r")) line = line.slice(0, -1);

                if (line.startsWith("---")) continue;
                if (line.startsWith("+++ b/")) {
                    const fileExtension: RegExpMatchArray | null = line.match(/\..+$/);
                    if (fileExtension) {
                        currentLanguage = getFileLanguage(fileExtension[0]);
                    }
                    else {
                        console.error(`Could not parse file extension from ${line}`);
                    }
                }
                else if ((line.startsWith("+") || line.startsWith("-")) && currentLanguage) {
                    // If langStats[currentLanguage] doesn't exist, make it.
                    langStats[currentLanguage] ??= {
                        additions: 0,
                        deletions: 0,
                        changes: 0,
                    };
                    const stats: LanguageStat | undefined = langStats[currentLanguage];
                    if (stats !== undefined) {
                        // Add to additions if new line added. Add to deletions if old line removed.
                        if (line.startsWith("+")) stats.additions += 1;
                        else stats.deletions += 1;
                        // In either case, increment changes.
                        stats.changes++;
                    }
                }
            }
        }
    } catch (e: unknown) {
        console.error(e);
    }
    return langStats;
}

export async function fetchGitHubCommits(generatedAt: string | null, repoList: string[]): Promise<GitHubCommit[]> {
        const commitsGitHub: GitHubCommit[] = []
        for await (const repo of repoList) {
            const url: string = `https://api.github.com/repos/Da-Scher/${repo}/commits`;
            console.log(url);
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
            console.log(commits.length);
            for (const commit of commits) {
                console.log(`working on ${commit.url}`);
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
                if (!commitSha) {
                    console.error(`${performance.now() - start}: Dropping commit with no sha from repo ${repo}`);
                    continue;
                }
                if (!commitAuthorDate) {
                    console.error(`${performance.now() - start}: Dropping commit ${commitSha} with no author date`);
                    continue;
                }
                const commitAuthorDateMS: number = Date.parse(commitAuthorDate);
                if (Number.isNaN(commitAuthorDateMS) || commitAuthorDateMS < 0) {
                    console.error(`${performance.now() - start}: Dropping commit ${commitSha} with invalid date: ` +
                    `${commitAuthorDateMS}`);
                    continue;
                }
                if(commitData.files?.length === 0) {
                    console.error(`${performance.now() - start}: could not retrieve file information from commit ${commitSha}`)
                }

                commitsGitHub.push(
                    {
                        ...commitData,
                        repo
                    }
                );
                //console.log(`${performance.now() - start}: Done with a commit.`);
                setTimeout(() => {}, 1000);
            }
        }
        return commitsGitHub;
}

export async function fetchCodebergCommits(generatedAt: string | null, cbRepos: string[]): Promise<CodebergCommit[]> {
    const commitsCodeberg: CodebergCommit[] = [];
    for await (const repo of cbRepos) {
        const url: string = `https://codeberg.org/api/v1/repos/dascher/${repo}/commits`;
        const response: Response = await fetch(
            url,
            {
                headers: CODEBERG_HEADERS,
            }
        )
        if (!response.ok) {
            throw new Error(
                `Failed to fetch Codeberg commits for repo ${repo}` +
                `Status: ${response.status} :: StatusText: ${response.statusText}`
            );
        }
        const responseData = await response.json() as CodebergCommit;

        if (!Array.isArray(responseData)) {
            throw new Error(
                `Expected an array of Codeberg commits for repo ${repo}`
            );
        }
        const commits: CodebergCommit[] = responseData.filter(
            (commit: CodebergCommit): boolean => { return commitFresh(generatedAt, commit) }
        );
        for (const commit of commits) {
            const response: Response = await fetch(
                commit.url,
                {
                    headers: CODEBERG_HEADERS,
                }
            )
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch Codeberg commit ${commit.url}` +
                    `Status: ${response.status} :: StatusText: ${response.statusText}`
                );
            }
            const commitData = await response.json() as CodebergCommit;
            const commitSha: string = commitData.sha;
            const commitCreated: string = commitData.created;

            if (!commitSha) {
                console.error(`Failed to parse sha from commit ${commit.url}`);
                continue;
            }
            if (!commitCreated) {
                console.error(`Failed to parse date from commit ${commit.url}`);
                continue;
            }
            const commitCreatedMS: number = Date.parse(commitCreated);
            if (Number.isNaN(commitCreatedMS) || commitCreatedMS < 0) {
                console.error(`Dropping commit with invalid date: ${commitCreatedMS}`);
            }
            commitsCodeberg.push({
                ...commitData,
                repo
            })
        }
    }
    return commitsCodeberg;
}

export interface NormalizeCommitsOptions {
    commitsGitHub?: GitHubCommit[];
    commitsGitLab?: undefined;
    commitsCodeberg?: CodebergCommit[];
}

export function normalizeGitHubCommit(commit: GitHubCommit): CommitActivity | null {
    const provider = "github" as const;
    const repo: string = commit.repo;
    const sha: string = commit.sha;
    const message: string = commit.commit.message;
    const author: {name: string; date: string} | null = commit.commit.author;
    if (!author) {
        console.error(`Had to drop commit. Author does not exist.`);
        return null;
    }
    const authoredAt: string = author.date;
    const url: string = commit.html_url;
    const languageStats: NormalizedLanguageStats = {
        stats: {},
        totals: {
            additions: 0,
            deletions: 0,
            changes: 0,
        }
    };
    if (commit.files) {
        languageStats.stats = getGitHubLanguageStatistics(commit.files);
        languageStats.totals = Object.values(languageStats.stats).reduce<LanguageStat>(
            (total, stat) => {
                total.additions += stat.additions;
                total.deletions += stat.deletions;
                total.changes += stat.changes;

                return total;
            },
            {
                additions: 0,
                deletions: 0,
                changes: 0,
            }
        );
    }
    return {
        provider,
        repo,
        sha,
        message,
        authoredAt,
        url,
        languageStats,
    }
}

export async function normalizeCodebergCommit(commit: CodebergCommit): Promise<CommitActivity> {
    const provider = "codeberg" as const;
    const repo: string = commit.repo;
    const sha: string = commit.sha;
    const message: string = commit.commit.message;
    const authoredAt: string = commit.created;
    const url: string = commit.html_url;
    const languageStats: NormalizedLanguageStats = {
        stats: {},
        totals: {
            additions: 0,
            deletions: 0,
            changes: 0,
        },
    };
    const stats: LanguageStats | null = await getCodebergLanguageStatistics(repo, sha);
    if (stats) {
        languageStats.stats = stats;
        languageStats.totals = Object.values(languageStats.stats).reduce<LanguageStat>(
            (total, stat) => {
                total.additions += stat.additions;
                total.deletions += stat.deletions;
                total.changes += stat.changes;
                return total;
            },
            {
                additions: 0,
                deletions: 0,
                changes: 0,
            }
        )
    }
    else {
        console.error(`Failed to get language stats for commit: ${commit.url}/${sha}`);
    }
    return {
        provider,
        repo,
        sha,
        message,
        authoredAt,
        url,
        languageStats,
    }
}

export async function normalizeCommits({commitsGitHub = undefined, commitsGitLab = undefined, commitsCodeberg = undefined}: NormalizeCommitsOptions): Promise<CommitActivityResponse> {
    const caList: CommitActivity[] = [];
    // normalize all GitHub commits
    for (const commit of commitsGitHub? commitsGitHub : []) {
        const check: CommitActivity | null = normalizeGitHubCommit(commit);
        if (check) {
            caList.push(check);
        }
    }
    // normalize all Codeberg commits
    for (const commit of commitsCodeberg? commitsCodeberg : []) {
        const check: CommitActivity | null = await normalizeCodebergCommit(commit);
        if (check) {
            caList.push(check);
        }
    }
    return {
        generatedAt: new Date().toISOString(),
        commits: caList,
    }
}

export async function getNormalizedData(): Promise<boolean> {
    const timerStart: DOMHighResTimeStamp = performance.now();
    // check if file at '../public/data/commits.js' exists
    // create file if it does not.
    const {commitActivityResponse, generatedAt} = await (async (): Promise<{
        commitActivityResponse: CommitActivityResponse,
        generatedAt: string | null,
    }> => {
        if (!await commitsJsonExists()) {
            console.log("../public/data/commits.json does not exist.");
            return {
                commitActivityResponse: {
                    generatedAt: "",
                    commits: [],
                },
                generatedAt: null,
            };
        } else {
            const fc: string = await fs.promises.readFile("../public/data/commits.json", "utf8");
            const fcJson = JSON.parse(fc);
            if (fcJson.generatedAt) {
                // console.log(commitsJson.generatedAt);
                return {
                    commitActivityResponse: {
                        generatedAt: fcJson.generatedAt,
                        commits: fcJson.commits,
                    },
                    generatedAt: fcJson.generatedAt,
                };
            } else {
                console.error(`getNormalizedData() :: ${performance.now() - timerStart} ms :: Failed to parse generatedAt from commits.json.`);
                return {
                    commitActivityResponse: {
                        generatedAt: "",
                        commits: [],
                    },
                    generatedAt: null,
                };
            }
        }
    })();

    // get GitHub repositories.
    const ghRepos: string[] = await fetchGitHubRepos(generatedAt).catch(
        (error) => {
            console.error(`getNormalizedData() :: ${performance.now() - timerStart} ms :: fetchGitHubRepos() Error: ${error.message}`);
            return [];
        }
    );
    // dev only
    //const ghRepos: string[] = ["dev-dakotaschaeffer"];
    if (ghRepos.length === 0) {
        console.error(`getNormalizedData() :: ${performance.now() - timerStart} ms :: No GitHub repos found.`);
        return false;
    }
    const timerGHRepos: DOMHighResTimeStamp = performance.now() - timerStart;
    console.log(`getNormalizedData() :: ${performance.now() - timerStart} ms :: Duration to get GitHub repos: ${timerGHRepos.toFixed(2)} ms`);
    const ghCommits: GitHubCommit[] = await fetchGitHubCommits(generatedAt, ghRepos).catch((error) => {
        console.error(`getNormalizedData() :: ${performance.now() - timerStart} ms :: fetchGitHubCommits() Error: ${error.message}`);
        return [];
    });
    if (ghCommits.length === 0) {
        console.error(`getNormalizedData() :: ${performance.now() - timerStart} ms :: No GitHub commits found.`);
    }
    const timerGHCommits: DOMHighResTimeStamp = performance.now() - timerStart;
    console.log(`getNormalizedData() :: ${performance.now() - timerStart} ms :: Duration to get ${ghCommits.length} GitHub commits: ${(timerGHCommits - timerGHRepos).toFixed(2)} ms`);
    console.log(`getNormalizedData() :: ${performance.now() - timerStart} ms :: Getting Codeberg repositories.`);
    const cbRepos: string[] = await fetchCodebergRepos(generatedAt).catch(
        (error) => {
            console.error(`getNormalizedData() :: ${performance.now() - timerStart} ms :: fetchCodebergRepos() error: ${error.message}`);
            return [];
        }
    );
    const timerCBRepos: DOMHighResTimeStamp = performance.now() - timerStart;
    console.log(`getNormalizedData() :: ${performance.now() - timerStart} ms :: Duration to get Codeberg repos: ${(timerCBRepos-timerGHCommits).toFixed(2)} ms`);
    const cbCommits: CodebergCommit[] = await fetchCodebergCommits(generatedAt, cbRepos).catch(
        (error) => {
            console.error(`getNormalizedData() :: ${performance.now() - timerStart} ms :: fetchCodebergCommits() Error: ${error.message}`)
            return [];
        }
    )
    if (cbCommits.length === 0) {
        console.error(`getNormalizedData() :: ${performance.now() - timerStart} ms :: No Codeberg commits.`)
    }
    const timerCBCommits: DOMHighResTimeStamp = performance.now() - timerStart;
    console.log(`getNormalizedData() :: ${performance.now() - timerStart} ms :: Duration to get Codeberg commits: ${(timerCBCommits - timerCBRepos).toFixed(2)} ms`);
    const normalizedCommits: CommitActivityResponse = await normalizeCommits({commitsGitHub: ghCommits, commitsCodeberg: cbCommits});
    const timerNormalizedCommits: DOMHighResTimeStamp = performance.now() - timerStart;
    console.log(`getNormalizedData() :: ${performance.now() - timerStart} ms :: Duration to have normalized commits: ${timerNormalizedCommits.toFixed(2)} ms`);
    if (commitActivityResponse.generatedAt === "") {
        commitActivityResponse.generatedAt = normalizedCommits.generatedAt;
        commitActivityResponse.commits = normalizedCommits.commits;
        await fs.promises.writeFile("../public/data/commits.json", JSON.stringify(commitActivityResponse, null, 2), "utf8");
    }
    else {
    await fs.promises.writeFile("../public/data/commits.json", JSON.stringify(normalizedCommits, null, 2), "utf8");
    }
    return false;
}

getNormalizedData();
