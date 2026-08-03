import type {CommitActivityResponse} from "../src/types/commit";
import * as fs from "node:fs";
import {GitHubCommit, GitHubRepository} from "./types/github";

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

export async function fetchGitHubRepos(): Promise<string[]> {

    const response: Response = await fetch("https://api.github.com/users/Da-Scher/repos");
    if (!response.ok) {
        throw new Error(
            `Failed to GitHub GitHub repos: ${response.statusText}`
        )
    }
    const json: GitHubRepository[] = await response.json();

    return json
        .filter((item: object): boolean => { return (new Date().getTime() - new Date(item.pushed_at).getTime()) <= TIME_RANGE })
        .map((item: object): string => { return item.name })
}

export async function fetchGitHubCommits(repoList: string[]): Promise<GitHubCommit[]> {
    try {
        const now = new Date().getTime();
        const commitsGitHub: GitHubCommit[] = []
        for await (const repo of repoList) {
            const url: string = `https://api.github.com/Da-Scher/${repo}/commits`;
            const response: Response = await fetch("https://api.github.com/repos/Da-Scher/${repo}/commits.json", {});

            if (!response.ok) {
                throw new Error(`Failed to fetch GitHub commit. ${response.statusText}`);
            }
            const json: GitHubCommit = await response.json();
            for (const commit of json) {
                if (commit.sha === undefined) {
                    throw new Error(`Failed to parse sha from commit in ${url}`);
                }
                const sha: string = json.sha;
                if (commit.commit.author === null) {
                    throw new Error(`Failed to parse author from commit ${url}/${sha}`);
                }
                if (commit.commit.author.date === undefined) {
                    throw new Error(`Failed to parse date from commit ${url}/${sha}`);
                }
                const authorDate: string = commit.commit.author.date;
                if (now - new Date(authorDate).getTime() <= TIME_RANGE) {
                    console.log(`time difference: ${now - new Date(authorDate).getTime()}`);
                    commitsGitHub.push(commit);
                }
            }
        }
        return commitsGitHub;
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error(`fetchGitHubCommits::Error(${e.message})`)
            return []
        }
    }
}

export interface NormalizeCommitsOptions {
    commitsGitHub?: GitHubCommit[];
    commitsGitLab?: unknown;
    commitsCodeberg?: unknown;
}

export function normalizeCommits(commitsList: GitHubCommit[]): CommitActivityResponse {
    return {
        generatedAt: new Date().toISOString(),
        commits: [],
    }
}

export async function getNormalizedData(): Promise<boolean> {
    // check if file at './public/data/commits.js exists
    if(await commitsJsonExists()) {
        console.log("File exists");
        return true;
    } else {
        console.log("File does not exist");
        return false;
    }
}

