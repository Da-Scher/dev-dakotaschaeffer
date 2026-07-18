import React from "react";
import Project from "./Project";

function Projects (): React.JSX.Element {
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