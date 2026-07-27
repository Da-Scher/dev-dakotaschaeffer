import React from "react";
import Project from "./Project";
import type {CommitActivityResponse, CommitActivity} from "../types/commit";

interface ProjectsProps {
    commitActivityResponse: CommitActivityResponse | null;
}

function Projects ({commitActivityResponse}: ProjectsProps): React.JSX.Element {
    if (!commitActivityResponse) {
        return <p>Loading projects...</p>;
    }

    const commitActivities: CommitActivity[] = commitActivityResponse.commits

    // order of appearance:
    // start with 5 latest projects.
    // then 5 latest projects with some qualifier: programs with language, name, etc.

    // each project should have a description, then a name, then a date, and the first 5 lines from the README.md.
    return (
        <div className={"grid grid-rows-5 gap-1 mt-1"}>
            <Project Descr={"Example 1 Description"} Name={"Example 1 Project"} When={new Date("2020-01-01")} Bullets={["Bullet One", "Bullet Two", "Bullet Three"]} />
            <Project Descr={"Example 2 Description"} Name={"Example 2 Project"} When={new Date("2020-02-01")} Bullets={["Bullet One", "Bullet Two", "Bullet Three"]} />
            <Project Descr={"Example 3 Description"} Name={"Example 3 Project"} When={new Date("2020-03-01")} Bullets={["Bullet One", "Bullet Two", "Bullet Three"]} />
            <Project Descr={"Example 4 Description"} Name={"Example 4 Project"} When={new Date("2020-04-01")} Bullets={["Bullet One", "Bullet Two", "Bullet Three"]} />
            <Project Descr={"Example 5 Description"} Name={"Example 5 Project"} When={new Date("2020-05-01")} Bullets={["Bullet One", "Bullet Two", "Bullet Three"]} />
        </div>
    );
}

export default Projects;