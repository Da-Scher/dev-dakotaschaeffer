import { createContext } from "react";
import type { CommitActivity } from "../types/commit";
import type { ProgrammingLanguage } from "../types/programlanguages";

export interface ProjectsContextValue {
    filteredCommits: CommitActivity[] | undefined;
    selectedLanguages: Set<ProgrammingLanguage>;
    searchTags: Set<string>;
    toggleLanguage: (language: ProgrammingLanguage) => void;
    addSearchTags: (text: string) => void;
    clearTags: () => void;
}

export const ProjectsContext =
    createContext<ProjectsContextValue | null>(null);