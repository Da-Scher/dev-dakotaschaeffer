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