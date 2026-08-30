import React from "react";
import type {CommitActivityResponse} from "../types/commit";
import ProjectsLanguageStats from "./ProjectsLanguageStats";
import ProjectsSearch from "./ProjectsSearch";

export interface ProjectsHeaderProps {
    commitActivityResponse: CommitActivityResponse | null;
}

function ProjectsHeader({commitActivityResponse}: ProjectsHeaderProps): React.JSX.Element {
    if (!commitActivityResponse) {
        return <p>Loading commits...</p>
    }

    return (
        <>
            <ProjectsLanguageStats commitActivityResponse={commitActivityResponse} />
            <ProjectsSearch languageSearch={null} nameSearch={null} dateSearch={true} />
        </>
    )
}

export default ProjectsHeader;