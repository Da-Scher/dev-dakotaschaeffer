import { createContext } from "react";
import type { CommitActivity } from "../types/commit";
import type { LanguageSlice } from "../components/DataGraphs/LanguagePieChart";
//import type { ProgrammingLanguage } from "../types/programlanguages";

export interface ProjectsContextValue {
    filteredCommits: CommitActivity[] | undefined;
    selectedLanguages: Set<LanguageSlice>;
    searchTags: Set<string>;
    toggleSlice: (language: LanguageSlice | string) => void;
    addSearchTags: (text: string) => void;
    removeSearchTags: (text: string) => void;
    clearTags: () => void;
    eventPieChartToggle: string;
}

export const ProjectsContext =
    createContext<ProjectsContextValue | null>(null);