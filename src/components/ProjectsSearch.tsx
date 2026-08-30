import React from "react";

export interface ProjectsSearchProps {
    languageSearch: ProgrammingLanguage | null;
    nameSearch: string | null;
    dateSearch: boolean;
}

function ProjectsSearch(
    {
        languageSearch = null,
        nameSearch = null,
        dateSearch = true
    }: ProjectsSearchProps
): React.JSX.Element {

    return (
        <>
            <p>Projects Search: {languageSearch} {nameSearch} {dateSearch}</p>
        </>
    )
}

export default ProjectsSearch;