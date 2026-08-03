import {faker} from "@faker-js/faker";

import {GitHubCommit, GitHubCommitFile, GitHubRepository} from "../../types/github";

type FixtureAge = "edge" | "fresh" | "stale";

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const STALE_AFTER_DAYS: number = 364;

interface RepositoryFixtureOptions {
    age?: FixtureAge;
    now?: Date;
    overrides?: Partial<GitHubRepository>
    owner?: string;
}

interface CommitFileFixtureOptions {
    overrides?: Partial<GitHubCommitFile>;
}

interface CommitFixtureOptions {
    age?: FixtureAge;
    now?: Date;
    repo?: GitHubRepository;
    fileCount?: number;
    overrides?: Partial<GitHubCommit>
}

function getCutoffDate(
    now: Date = new Date(),
    staleAfterDays: number = STALE_AFTER_DAYS
): Date {
    return new Date(now.getTime() - staleAfterDays * MS_IN_DAY);
}

function fakeDateByAge(
    age: FixtureAge = "fresh",
    now: Date = new Date(),
): Date {
    const cutoff: Date = getCutoffDate(now);
    if(age === "stale") {
        return faker.date.between({
            from: new Date(
                now.getTime() - 3 * 365 * MS_IN_DAY
            ),

            to: new Date(cutoff.getTime() - 1)
        })
    }

    else if(age === "edge") {
        return now;
    }

    return faker.date.between({
        from: cutoff,
        to: now
    })
}

export function makeGitHubRepository({
    age = "fresh",
    now = new Date(),
    overrides = {},
}: RepositoryFixtureOptions = {}, owner: string = ""): GitHubRepository {
    owner = owner.length === 0 ? faker.internet.username() : owner;
    const repoName: string = faker.helpers.slugify(faker.word.words({count: 2}));
    return {
        name: repoName,
        html_url: `https://github.com/${owner}/${repoName}`,
        pushed_at: fakeDateByAge(age, now).toISOString(),
        ...overrides,
    };
}

export function makeGitHubCommitFile({
    overrides = {},
}: CommitFileFixtureOptions = {}): GitHubCommitFile {
    const additions: number = faker.number.int({
        min: 0,
        max: 500,
    })
    const deletions: number = faker.number.int({
        min: 0,
        max: 500,
    })
    const extensions: string = faker.helpers.arrayElement([
        "ts",
        "tsx",
        "js",
        "c",
        "cpp",
        "h",
        "py",
        "rs",
    ]);

    return {
        filename: `${faker.word.noun()}.${extensions}`,
        additions,
        deletions,
        changes: additions + deletions,
        status: faker.helpers.arrayElement([
            "added",
            "modified",
            "removed",
        ]),
        ...overrides,
    }
}

export function makeGitHubCommit({
    age = "fresh",
    now = new Date(),
    repo = makeGitHubRepository({
        age,
        now
    }),
    fileCount = 3,
    overrides = {},
}: CommitFixtureOptions = {}): GitHubCommit {
    const sha: string = faker.git.commitSha();
    const message: string = faker.git.commitMessage();
    const authorName: string = faker.internet.username();
    const authorDate: string = fakeDateByAge(age, now).toISOString();

    return {
        sha,
        html_url:
            `${repo.html_url}/commit/${sha}`,
        commit: {
            message: message,
            author: {
                name: authorName,
                date: authorDate,
            },
            committer: {
                name: authorName,
                date: authorDate,
            },

            files: faker.helpers.multiple(
                (): GitHubCommitFile => makeGitHubCommitFile(),
                {
                    count: fileCount
                },
            ),
            ...overrides,
        }
    }
}

interface FakerRepoListOptions {
    count?: number;
    age?: FixtureAge | "all";
    now?: Date;
    overrides?: Partial<GitHubRepository>
}

export function fakerRepoList({
    count = 5,
    age = "all",
    now = new Date(),
    overrides = {},
}: FakerRepoListOptions = {}) {
    const repoList: GitHubRepository[] = [];
    for(let i: number = 0; i < count; i++) {
        const ghRepo: GitHubRepository = makeGitHubRepository({
            age: age === "all" ? faker.helpers.arrayElement(["edge", "fresh", "stale"]) : age,
            now: now,
            overrides: overrides,
        })
        repoList.push(ghRepo);
    }
    return repoList;
}
interface FakerCommitListOptions {
    count?: number;
    age?: FixtureAge | "all";
    now?: Date;
    overrides?: Partial<GitHubCommit>
}
export function fakerCommitList({
    count = 5,
    age = "all",
    now = new Date(),
    overrides = {},
}: FakerCommitListOptions = {}) {
    const commitList: GitHubCommit[] = [];
    for(let i: number = 0; i < count; i++) {
        const ghCommit: GitHubCommit = makeGitHubCommit({
            age: age === "all" ? faker.helpers.arrayElement(["edge", "fresh", "stale"]) : age,
            now: now,
            overrides: overrides,
        })
        commitList.push(ghCommit);
    }
    return commitList;
}