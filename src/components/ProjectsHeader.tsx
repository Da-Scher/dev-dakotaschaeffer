import React from "react";
import ProjectsLanguageStats from "./ProjectsLanguageStats";
import ProjectsSearch from "./ProjectsSearch";

function ProjectsHeader(): React.JSX.Element {

    return (
        <>
            <ProjectsLanguageStats />
            <ProjectsSearch />
        </>
    )
}

export default ProjectsHeader;