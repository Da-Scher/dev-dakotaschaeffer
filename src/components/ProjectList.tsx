import React from "react";
import type {CommitActivityResponse, CommitActivity} from "../types/commit";

interface ProjectListProps {
    commitActivityResponse: CommitActivityResponse | null;
}

function ProjectList ({commitActivityResponse}: ProjectListProps): React.JSX.Element {
    if (!commitActivityResponse) {
        return <p>Loading projects...</p>;
    }

    const commitActivities: CommitActivity[] = commitActivityResponse.commits

    // order of appearance:
    // start with 5 latest projects.
    // then 5 latest projects with some qualifier: programs with language, name, etc.

    // each project should have a description, then a name, then a date, and the first 5 lines from the README.md.
    return (
        <div>
            <p>ProjectList</p>
        </div>
    );
}

export default ProjectList;