import React from "react";
import ProjectsLanguageStats from "./ProjectsLanguageStats";
import ProjectsSearch from "./ProjectsSearch";

function ProjectsHeader(): React.JSX.Element {

    return (
        <div className={"md:min-h-[75vh]"}>
            <ProjectsLanguageStats />
            <ProjectsSearch />
        </div>
    )
}

export default ProjectsHeader;