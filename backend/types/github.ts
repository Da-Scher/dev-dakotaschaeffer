export interface GitHubRepository {
    name: string;
    html_url: string;
    url: string;
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
    status: "added" | "modified" | "removed" | "renamed";
}