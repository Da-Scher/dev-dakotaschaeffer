import { useContext } from "react";
import type {LanguageStatisticsContextValue} from "./ProjectsContext";
import { ProjectsContext } from "./ProjectsContext";

export function useProjectsContext(): LanguageStatisticsContextValue {
    const context = useContext(ProjectsContext);

    if (!context) {
        throw new Error(
            "useProjectsContext must be used inside ProjectsProvider"
        );
    }

    return context;
}