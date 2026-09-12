import React from "react";
import type {ReadmeData} from "../types/commit";
import type {NormalizedLanguageStats} from "../types/programlanguages";
import ProjectLanguagePieChart from "./DataGraphs/ProjectLanguagePieChart";

interface ProjectProps extends React.HTMLProps<HTMLDivElement> {
    project: NormalizedLanguageStats | undefined;
    Name: string;
    When: string;
    Readme: ReadmeData | undefined;
}

function Project ({project, Name, When, Readme}: ProjectProps): React.JSX.Element {
    const readme: string = Readme !== undefined
    ?   Readme.content.length > 109
        ?   [Readme.content.slice(0, 104), "..."].join(" ")
        :   Readme.content
    :   "No README.md for this project.";
    return (
        <div className={"bg-gray-400 text-black grid grid-cols-2 grid-rows-5 rounded-2xl border-2 border-gray-100"}>
            <p className={"row-start-2 col-start-1 text-left pl-4"}>{Name}</p>
            <p className={"row-start-1 col-start-2 text-right pr-4"}>{When}</p>
            <p>{readme}</p>
            <ProjectLanguagePieChart languageStats={project}/>
        </div>
    );
}

export default Project;