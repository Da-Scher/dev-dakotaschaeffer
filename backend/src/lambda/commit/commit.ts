export type ProgrammingLanguage =
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

export type LanguageStats = Partial<Record<ProgrammingLanguage, LanguageStat>>;

export interface NormalizedLanguageStats {
    stats: LanguageStats;
    totals: LanguageStat;
}
export interface CommitActivity {
    provider: "Codeberg" | "GitHub" | "GitLab";
    repo: string;
    sha: string;
    message: string;
    authoredAt: string;
    url: string;
    languageStats?: NormalizedLanguageStats;
}

export interface CommitActivityResponse {
    readmes?: ReadmeData[];
    generatedAt: string;
    commits: CommitActivity[];
}

export interface ReadmeData {
    repo: string;
    contents: string;
    encoding: string;
    size: number;
}