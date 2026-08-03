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
    return Promise.reject("TODO: Complete Me.");
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

