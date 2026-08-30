import type {NormalizedLanguageStats} from "./programlanguages";

export interface CommitActivity {
    provider: "github" | "gitlab" | "codeberg";
    repo: string;
    sha: string;
    message: string;
    authoredAt: string;
    url: string;
    languageStats?: NormalizedLanguageStats;
}

export interface CommitActivityResponse {
    generatedAt: string;
    commits: CommitActivity[];
}