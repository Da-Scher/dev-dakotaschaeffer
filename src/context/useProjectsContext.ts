import { useContext } from "react";
import type {ProjectsContextValue} from "./ProjectsContext";
import { ProjectsContext } from "./ProjectsContext";

export function useProjectsContext(): ProjectsContextValue {
    const context = useContext(ProjectsContext);

    if (!context) {
        throw new Error(
            "useProjectsContext must be used inside ProjectsProvider"
        );
    }

    return context;
}