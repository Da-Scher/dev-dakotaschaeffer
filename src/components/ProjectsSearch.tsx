import React from "react";
import {useProjectsContext} from "../context/useProjectsContext";
import type {LanguageSlice} from "./DataGraphs/LanguagePieChart";

function ProjectsSearch(): React.JSX.Element {
    const {searchTags, selectedLanguages, addSearchTags, removeSearchTags, toggleSlice} = useProjectsContext();
    const tags: (string | LanguageSlice)[] = [...selectedLanguages, ...searchTags];
    function tagIsLanguage(tag: string): boolean {
        const langList: string[] = [ "C", "C++", "Haskell", "HTML/CSS", "GDScript", "Java", "JavaScript", "Lua", "OCamel", "Python", "Shell", "TypeScript", "Yaml",];
        console.log(`"langList.includes("${tag}") === ${langList.includes(tag)}"`);
        return langList.includes(tag);
    }
    return (
        <section
            className={[
                "grid grid-rows-2 gap-1 mt-1 mb-1",
            ].join(" ")}
        >
            <form
                role={"search"}
                className={[
                    "flex mt-0.5 mb-0.5"
                ].join(' ')}
                onSubmit={(event) => {
                    event?.preventDefault()
                    const formData = new FormData(event.currentTarget);
                    const newTag = formData.get("tag-input")?.toString();
                    if (newTag) {
                        if (tagIsLanguage(newTag)) {
                            console.log(newTag + " is a language.");
                            toggleSlice(newTag);
                        }
                        else addSearchTags(newTag);
                    }
                }}
            >
                <label
                    htmlFor={"projects-search"}
                    className={[
                        "w-1/5"
                    ].join(" ")}
                >
                    Search Projects:
                </label>
                <input
                    type={"search"}
                    id={"projects-search"}
                    name={"tag-input"}
                    defaultValue={""}
                    onChange={() => {
                    }}
                    placeholder={"Tag..."}
                    className={[
                        "w-full bg-transparent",
                        "placeholder:text-slate-400 text-slate-700 text-sm",
                        "border border-slate-200 rounded-md px-3 py-2",
                        "transition duration-300 ease",
                        "focus:outline-none focus:border-slate-400",
                        "hover:border-slate-300 shadow-sm focus:shadow",
                    ].join(" ")}
                />
                <button
                    type="submit"
                    className={[
                        "bg-transparent w-1/7 ml-2",
                        "text-slate-400",
                        "border"
                    ].join(" ")}
                >
                    Search
                </button>

            </form>
            <section
                className={[
                    "mb-0.5 mt-0.5 ml-2 mr-2",
                    `border ${tags.length > 0 ? "border-slate-400" : "border-slate-200"}`,
                    "flex"
                ].join(" ")}
            >
                {
                    tags.length > 0 && tags.map((tag) => {
                        if (tag) {
                            if (typeof tag !== "string") {
                                console.log("tag is slice: tag.color: " + tag.color);
                                return (
                                    <span
                                        key={`tag-language-${tag}`}
                                        className={[
                                            "bg-slate-600 text-slate-200",
                                            "border border-slate-400 rounded-md px-3 py-2",
                                            "flex items-center"
                                        ].join(" ")}
                                        onClick={() => toggleSlice(tag as LanguageSlice)}
                                    >
                                    <div
                                        className={`mr-1 w-3 h-3 border border-transparent rounded-4xl`}
                                        style={{backgroundColor: `${tag.color ? tag.color : "bg-slate-300"}`}}
                                    />

                                        {tag.language}
                                </span>

                                );
                            } else {
                                return (
                                    <span
                                        key={`tag-search-${tag}`}
                                        className={[
                                            "bg-slate-600 text-slate-200",
                                            "border border-slate-400 rounded-md px-3 py-2",
                                            "flex items-center"
                                        ].join(" ")}
                                        onClick={() => removeSearchTags(tag)}
                                    >
                                    {tag}
                                </span>
                                );
                            }
                        }
                    })
                }
            </section>
        </section>
    )
}

export default ProjectsSearch;