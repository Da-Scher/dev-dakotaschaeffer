import React from "react";
import {CommitActivity} from "../types/commit";

interface ProjectsHeaderProps {
    commitsActivity: CommitActivity[];
}

function ProjectsHeader({commitsActivity}: ProjectsHeaderProps): React.JSX.Element {

    return (
        <>
            <h2>ProjectsHeader</h2>
        </>
    );
}

export default ProjectsHeader;