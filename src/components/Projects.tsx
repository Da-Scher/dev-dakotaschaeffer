import React from "react";
import type {CommitActivityResponse} from "../types/commit";
import ProjectsHeader from "./ProjectsHeader";
import ProjectList from "./ProjectList";
import {ProjectsProvider} from "../context/ProjectsProvider";

interface ProjectsProps {
    commitActivityResponse: CommitActivityResponse | null;
}

function Projects ({commitActivityResponse}: ProjectsProps): React.JSX.Element {

    // Perform commitActivityResponse is null check.
    if (!commitActivityResponse) {
        return <p>Loading projects...</p>
    }
    // order of appearance:
    // Project header
    // Project list

    return (
        <ProjectsProvider commits={commitActivityResponse.commits}>
            <ProjectsHeader />
            <ProjectList />
        </ProjectsProvider>
    );
}

export default Projects;