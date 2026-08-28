import React from "react";
import type {CommitActivity, CommitActivityResponse} from "../types/commit";

export interface ProjectsHeaderProps {
    commitActivityResponse: CommitActivityResponse | null;
}

function ProjectsHeader({commitActivityResponse}: ProjectsHeaderProps): React.JSX.Element {
    if (!commitActivityResponse) {
        return <p>Loading commits...</p>
    }
    const commitActivities: CommitActivity[] = commitActivityResponse.commits;


    return (
        <>
            <p>Projects Header.</p>
        </>
    )
}

export default ProjectsHeader;