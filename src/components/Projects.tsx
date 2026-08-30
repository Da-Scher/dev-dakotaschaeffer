import React from "react";
import type {CommitActivityResponse} from "../types/commit";
import ProjectsHeader from "./ProjectsHeader";
import ProjectList from "./ProjectList";

interface ProjectsProps {
    commitActivityResponse: CommitActivityResponse | null;
}

function Projects ({commitActivityResponse}: ProjectsProps): React.JSX.Element {

    // order of appearance:
    // Project header
    // Project list

    return (
        <>
            <ProjectsHeader commitActivityResponse={commitActivityResponse} />
            <ProjectList commitActivityResponse={commitActivityResponse} />
        </>
    );
}

export default Projects;