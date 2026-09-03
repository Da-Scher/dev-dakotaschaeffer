import { createContext } from "react";
import type { CommitActivity } from "../types/commits";
import type { ProgrammingLanguage } from "../types/programlanguages";

export interface LanguageStatisticsContextValue {
    filteredCommits: CommitActivity[];
    selectedLanguages: Set<ProgrammingLanguage>;
    searchStringTags: Set<string>;
    toggleLanguage: (language: ProgrammingLanguage) => void;
    clearLanguages: () => void;
}

export const ProjectsContext =
    createContext<LanguageStatisticsContextValue | null>(null);