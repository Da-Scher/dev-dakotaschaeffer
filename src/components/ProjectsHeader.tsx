import React from "react";
import {CommitActivity} from "../types/commit";

interface ProjectsHeaderProps {
    commitActivity: CommitActivity[];
}

function ProjectsHeader({commitActivity}: ProjectsHeaderProps): React.JSX.Element {

    return (
        <>
            <h2>ProjectsHeader</h2>
        </>
    );
}

export default ProjectsHeader;