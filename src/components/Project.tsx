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
    if (!project || project.totals.changes === 0) {
        return (
            <div
                className={[
                    "h-64 w-full md:h-80 md:w-full",
                    "grid grid-cols-[1fr_0] grid-rows-[auto_1fr]",
                    "bg-(--project-background-color) text-black",
                    ""
                ].join(' ')}>
                <div className={"col-start-1 row-start-1 col-end-2 row-end-2"}>
                    <h2 className={"pl-4"}>{Name}</h2>
                </div>
                <div
                    className={[
                        "col-start-1 row-start-2 col-end-3 row-end-3",
                        "flex flex-col items-start justify-start",
                        "bg-(--main-color-dark) mx-2 mb-2 px-2 pb-2 pt-2",
                    ].join(' ')}
                >
                    <p className={""}>Last Commit: {new Date(When).getDate()} {new Date(When).getMonth() + 1} {new Date(When).getFullYear()}</p>
                    <p className={""}>{readme}</p>
                </div>
            </div>
        );
    }
    return (
        <div
            className={[
                "h-64 w-full md:h-80 md:w-full",
                "grid grid-cols-[1fr_0.25fr] grid-rows-[auto_1fr]",
                "bg-(--project-background-color) text-black",
                ""
            ].join(' ')}>
            <div className={"col-start-1 row-start-1 col-end-3 row-end-2"}>
                <h2 className={"pl-4 text-[24px] text-white pb-2 text-left"}>{Name}</h2>
            </div>
            <div
                className={[
                    "col-start-1 row-start-2 col-end-2 row-end-3",
                    "flex flex-col items-start justify-start",
                    "bg-(--main-color-dark) ml-2 mb-2 pl-2 pb-2 pt-2",
                ].join(' ')}
            >
                <p className={""}>Last Commit: {new Date(When).getDate()} {new Date(When).getMonth() + 1} {new Date(When).getFullYear()}</p>
                <p className={""}>{readme}</p>
            </div>
            <div className={"col-start-2 row-start-2 col-end-3 row-end-3"}>
                <ProjectLanguagePieChart languageStats={project}/>
            </div>

        </div>
    );
}

export default Project;