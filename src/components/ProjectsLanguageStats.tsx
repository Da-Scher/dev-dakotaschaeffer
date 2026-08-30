import React from "react";
import type {CommitActivityResponse} from "../types/commit";

export interface ProjectsLanguageStatsProps {
    commitActivityResponse: CommitActivityResponse;
}

function ProjectsLanguageStats(props: ProjectsLanguageStatsProps): React.JSX.Element {
    const {commitActivityResponse} = props;

    return (
        <>
            <p>Projects Language Stats</p>
        </>
    );
}

export default ProjectsLanguageStats;