import {getGHCommit, GitHubCommit} from "./provider/github.js";

import {getCBCommit, getCBPatch, getFilesFromPatch} from "./provider/codeberg.js";
import type {CodebergCommit} from "./provider/codeberg.js";

import {CommitActivity} from "./commit/commit.js"

import {loadCommits, saveCommits} from "./s3.js";
import {S3Client} from "@aws-sdk/client-s3";
import {getCodebergToken, getGitHubToken} from "./secrets.js";

export interface CommitPayload {
    provider: "GitHub" | "Codeberg";
    repo: string;
    sha: string;
}

export interface CommitFile {
    filename: string;
    additions: number;
    deletions: number;
    changes: number;
}
export interface LanguageStat {
    additions: number;
    deletions: number;
    changes: number;
}

export type ProgrammingLanguage =
    | "C"
    | "C++"
    | "Haskell"
    | "HTML/CSS"
    | "GDScript"
    | "Java"
    | "JavaScript"
    | "Lua"
    | "OCaml"
    | "Python"
    | "Shell"
    | "TypeScript"
    | "Yaml"

export interface NormalizedLanguageStats {
    stats: LanguageStats;
    totals: LanguageStat;
}

export type LanguageStats = Partial<Record<ProgrammingLanguage, LanguageStat>>

export const handler: (payload: CommitPayload) => Promise<void> = async (payload: CommitPayload): Promise<void> => {
    console.log(`payload: ${JSON.stringify(payload)}`);
    const bucket: string | undefined = process.env.COMMIT_BUCKET;
    if (!bucket) {
        throw new Error("COMMITS_BUCKET is not defined.");
    }
    const s3 = new S3Client({});
    const {commit, languageStats} = await (async (): Promise<{commit: GitHubCommit | CodebergCommit | null, languageStats: NormalizedLanguageStats | undefined}> => {
        switch (payload.provider) {
            case "GitHub": {
                const token: string = await getGitHubToken();
                if (token === null) {
                    throw new Error(`Did not receive GH token`, {cause: token});
                }
                const commit: GitHubCommit | null = await getGHCommit(payload, token);
                if (!commit) {
                    throw new Error(`Could not define commit @${payload.repo}:${payload.sha} from ${payload.provider}`);
                }

                return {
                    commit,
                    languageStats: normalizeLanguageStatistics(commit.files),
                };
            }

            case "Codeberg": {
                const token: string = await getCodebergToken();
                if (token === null) {
                    throw new Error(`Did not receive Codeberg token.`, {cause: token});
                }
                const commit: CodebergCommit | null = await getCBCommit(payload, token);
                if (!commit) {
                    throw new Error(`Could not define commit @${payload.repo}:${payload.sha} from ${payload.provider}`);
                }
                const patch: string | null = await getCBPatch(payload, token);
                const files: CommitFile[] | undefined = getFilesFromPatch(patch);

                return {
                    commit,
                    languageStats: normalizeLanguageStatistics(files),
                }
            }
            default: {
                throw new Error(`Unexpected provider: ${payload.provider}`);
            }
        }
    })();

    if (!commit) {
        throw new Error(`Could not define commit @${payload.repo}:${payload.sha} from ${payload.provider}`);
    }
    const normalizedCommit: CommitActivity | null = normalizeCommit(commit, payload, languageStats);
    if (!normalizedCommit) {
        throw new Error(`Could not normalize commit activity @${payload.repo}:${payload.sha} from ${payload.provider}`);
    }

    try {
        await writeCommitToS3Bucket(s3, bucket, normalizedCommit);
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Could not write to s3 bucket: ${error.message}`, { cause: error });
        }
    }
    //commitActivityResponse.commits.push(normalizedCommit);

    //await saveCommits(
    //    s3,
    //    bucket,
    //    "commits.json",
    //    commitActivityResponse,
    //    etag,
    //);
}

export async function writeCommitToS3Bucket(s3: S3Client, bucket: string | undefined, commit: CommitActivity): Promise<void> {
    if (!bucket) {
        throw new Error(`Bucket environment variable is not set.`);
    }

    const MAX_ATTEMPTS: number = 5;
    const key: string = "commits.json";
    for (let attempt: number = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const {commitActivityResponse, etag} = await loadCommits(s3, bucket, key);
        if (!etag) {
            throw new Error(`S3 bucket did not provide an etag.`, {cause: etag});
        }
        const alreadyExists: boolean =
            commitActivityResponse.commits.some(
                existing => existing.provider === commit.provider &&
                    existing.repo === commit.repo &&
                    existing.sha === commit.sha
            );
        if(!alreadyExists) {
            commitActivityResponse.commits.push(commit);
            commitActivityResponse.generatedAt = new Date().toISOString();
        }
        else {
            throw new Error(`The commit already exists in ${key}`, {cause: alreadyExists});
        }
        try {
            await saveCommits(s3, bucket, key, commitActivityResponse, etag);

            return;
        }
        catch (error: unknown) {
            const status: number | undefined = (error as {
                $metadata?: {
                    httpStatusCode?: number
                }
            }).$metadata?.httpStatusCode;
            if (status === undefined) {
                throw new Error('Status error object could not be defined.', { cause: error });
            }
            const conflict: boolean =
                status === 412 ||
                status === 409;
            if (!conflict || attempt === MAX_ATTEMPTS) {
                throw new Error(`Either max attempts reached and/or status was not 412 or 409: attempt = ${attempt} :: status = ${status}`, { cause: error });
            }
        }
    }
}
export function getFileLanguage(extension: string): ProgrammingLanguage | null {
    if (extension.match(/^\.[ch]$/)) {
        return "C";
    }
    else if (extension.match(/^\.(cpp|hpp)$/)) {
        return "C++";
    }
    else if (extension.match(/^\.(hs|lhs|hsc|c2hs|cpphs)$/)) {
        return "Haskell";
    }
    else if (extension.match(/^\.(css|html)$/)) {
        return "HTML/CSS";
    }
    else if (extension.match(/^\.gds$/)) {
        return "GDScript";
    }
    else if (extension.match(/^\.(java)$/)) {
        return "Java";
    }
    else if (extension.match(/^\.(js|jsx|test.js|config.js)$/)) {
        return "JavaScript";
    }
    else if (extension.match(/^\.(lua)$/)) {
        return "Lua";
    }
    else if (extension.match(/^\.(ml|mli)$/)) {
        return "OCaml";
    }
    else if (extension.match(/^\.py$/)) {
        return "Python";
    }
    else if (extension.match(/^\.sh$/)) {
        return "Shell";
    }
    else if (extension.match(/^\.(ts|tsx|test.ts|config.ts)$/)) {
        return "TypeScript"
    }
    else if (extension.match(/^\.(yaml|yml)$/)) {
        return "Yaml";
    }
    // in any other case, return null.
    return null;
}

export function normalizeLanguageStatistics(files: CommitFile[] | undefined): NormalizedLanguageStats | undefined {
    if (!files) return undefined;
    const langStats: LanguageStats = {};
    const normalLangStats: NormalizedLanguageStats = {
        stats: {},
        totals: {
            additions: 0,
            deletions: 0,
            changes: 0,
        },
    }
    // Collect LanguageStats into one entry per language
    for (const file of files) {
        const fileExtension: RegExpMatchArray | null = file.filename.match(/\..+$/);
        if (fileExtension !== null) {
            const lang: ProgrammingLanguage | null = getFileLanguage(fileExtension[0]);
            if (lang !== null) {
                langStats[lang] ??= {
                    additions: 0,
                    deletions: 0,
                    changes: 0,
                }

                langStats[lang].additions += file.additions;
                langStats[lang].deletions += file.deletions;
                langStats[lang].changes += file.changes;
            }
        }
    }
    normalLangStats.stats = langStats;
    normalLangStats.totals = Object.values(langStats).reduce<LanguageStat>(
        (total: LanguageStat, current: LanguageStat): LanguageStat => {
           total.additions += current.additions;
           total.deletions += current.deletions;
           total.changes += current.changes;
           return total;
        },
        {
            additions: 0,
            deletions: 0,
            changes: 0,
        });
    return normalLangStats;
}

export function normalizeCommit(commit: GitHubCommit | CodebergCommit, payload: CommitPayload, languageStats: NormalizedLanguageStats | undefined): CommitActivity | null {
    const provider: "GitHub" | "Codeberg" = payload.provider;
    if (
        provider === "GitHub" && !commit.html_url.includes("https://github.com/")
        || provider === "Codeberg" && !commit.html_url.includes("https://codeberg.org/"))
    {
        console.error(`Mismatched provider and origin. The commit's html_url is not from ${provider}`);
        return null;
    }
    const repo: string = payload.repo;
    const sha: string = payload.sha;
    if (commit.sha !== sha) {
        console.error(`normalizeCommit()::Lost sha somewhere in translation. commit.sha = ${commit.sha} !== payload.sha = ${sha}`);
        return null;
    }
    const [message, authoredAt, url]: [string, string, string] = getDifferentiatedData(commit);
    return {
        provider,
        repo,
        sha,
        message,
        authoredAt,
        url,
        languageStats,
    };
}

export function getDifferentiatedData(commit: CodebergCommit | GitHubCommit): [string, string, string] {
    if ("created" in commit) {
        return [commit.commit.message, commit.created, commit.html_url];
    }
    else {
        return [commit.commit.message, commit.commit.author.date, commit.html_url];
    }
}