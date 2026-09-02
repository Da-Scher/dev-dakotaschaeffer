import { createContext } from "react";
import type { CommitActivity } from "../types/commits";
import type { ProgrammingLanguage } from "../types/programlanguages";

export interface LanguageStatisticsContextValue {
    filteredCommits: CommitActivity[];
    selectedLanguages: Set<ProgrammingLanguage>;
    toggleLanguage: (language: ProgrammingLanguage) => void;
    clearLanguages: () => void;
}

export const LanguageStatisticsContext =
    createContext<LanguageStatisticsContextValue | null>(null);