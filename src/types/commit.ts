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