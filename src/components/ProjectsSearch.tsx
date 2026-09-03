import React from "react";
import {useProjectsContext} from "../context/useProjectsContext";
import type {ProgrammingLanguage} from "../types/programlanguages";

function ProjectsSearch(): React.JSX.Element {
    const {searchTags, selectedLanguages, addSearchTags, toggleLanguage} = useProjectsContext();
    const tags: (ProgrammingLanguage | string)[] = [...selectedLanguages, ...searchTags];
    return (
        <form
            role={"search"}
            onSubmit={(event) => {
                event?.preventDefault()
                const formData = new FormData(event.currentTarget);
                const newTag = formData.get("tag-input")?.toString();
                if (newTag !== undefined) {
                    switch (newTag) {
                        case "C":
                        case "C++":
                        case "Haskell":
                        case "HTML/CSS":
                        case "GDScript":
                        case "Java":
                        case "JavaScript":
                        case "Lua":
                        case "OCamel":
                        case "Python":
                        case "Shell":
                        case "TypeScript":
                        case "Yaml":
                            toggleLanguage(newTag);
                            break;
                        default:
                            addSearchTags(newTag);
                            break;
                    }
                }
            }}
        >
            <label
                htmlFor={"projects-search"}
            >
                {
                    tags.length > 0
                    ? tags.map((tag: ProgrammingLanguage | string, index: number) => (
                        <span
                            key={`tag-${index < selectedLanguages.size ? "language" : "string"}-${tag}`}
                        >
                            {tag}
                        </span>
                    ))
                    : "Search project by name or language."
                }
            </label>
            <input
                type={"search"}
                id={"projects-search"}
                name={"tag-input"}
                defaultValue={""}
                onChange={() => {}}
                placeholder={"Tag..."}
            />
            <button
                type="submit"
            >
                Add tag
            </button>

        </form>
    )
}

export default ProjectsSearch;