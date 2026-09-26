import React from "react";
import {useProjectsContext} from "../context/useProjectsContext";
import type {LanguageSlice} from "./DataGraphs/LanguagePieChart";

function ProjectsSearch(): React.JSX.Element {
    const {searchTags, selectedLanguages, addSearchTags, removeSearchTags, toggleSlice} = useProjectsContext();
    const tags: (string | LanguageSlice)[] = [...selectedLanguages, ...searchTags];
    function tagIsLanguage(tag: string): boolean {
        const langList: string[] = [ "C", "C++", "Haskell", "HTML/CSS", "GDScript", "Java", "JavaScript", "Lua", "OCamel", "Python", "Shell", "TypeScript", "Yaml",];
        //console.log(`"langList.includes("${tag}") === ${langList.includes(tag)}"`);
        return langList.includes(tag);
    }
    return (
        <section
            className={[
                "grid grid-rows-[minmax(0, 1fr),minmax(0, auto)] gap-1 mt-4 mb-1 ml-4 mr-4",
                "bg-(--main-color) rounded-2xl"
            ].join(" ")}
        >
            <form
                role={"search"}
                className={[
                    "flex mt-2 mb-2 h-10 lg:h-20"
                ].join(' ')}
                onSubmit={(event) => {
                    event?.preventDefault()
                    const formData = new FormData(event.currentTarget);
                    const newTag = formData.get("tag-input")?.toString();
                    if (newTag) {
                        if (tagIsLanguage(newTag)) {
                            //console.log(newTag + " is a language.");
                            //console.log(`ProjectsSearch: Would toggleSlice here.`)
                            toggleSlice(newTag);
                        }
                        else addSearchTags(newTag);
                    }
                }}
            >
                <label
                    htmlFor={"projects-search"}
                    className={[
                        "w-1/7 px-2",
                        "content-center text-center text-xs lg:text-xl"
                    ].join(" ")}
                >
                    Search
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
                        "content-center w-full bg-(--main-color-dark)",
                        "lg:text-xl placeholder:text-slate-400 text-slate-400 text-sm",
                        "border-t-2 border-l-2 border-t-black border-l-black rounded-4xl px-3 py-2 mr-2",
                        "transition duration-300 ease",
                    ].join(" ")}
                />
                <button
                    type="submit"
                    className={[
                        "content-center bg-(--main-color-dark) w-1/7 rounded-4xl px-2 mr-2",
                        "text-slate-400 text-xs lg:text-xl",
                        "border"
                    ].join(" ")}
                >
                    Search
                </button>

            </form>
            { tags.length > 0 &&
            <section
                className={[
                    "mb-0.5 mt-0.5 ml-2 mr-2",
                    "flex flex-nowrap overflow-scroll lg:flex-wrap lg:justify-center"
                ].join(" ")}
            >
                {tags.length > 0 && tags.map((tag) => {
                    if (tag) {
                        if (typeof tag !== "string") {
                            //console.log("tag is slice: tag.color: " + tag.color);
                            return (
                                <span
                                    key={`tag-language-${tag}`}
                                    className={[
                                        "min-w-25 w-25 max-w-25 h-8 md:w-40 md:max-w-40 md:h-12 lg:text-2xl lg:justify-center lg:w-64 lg:max-w-64 lg:h-16 bg-(--accent-color) text-slate-200",
                                        "border-b border-r border-b-black border-r-black rounded-4xl px-0.5 py-0.5",
                                        "flex items-center"
                                    ].join(" ")}
                                    onClick={() => {
                                        //console.log(`ProjectsSearch: onClick Would toggleSlice here.`)
                                        toggleSlice(tag as LanguageSlice)
                                    }}
                                >
                                    <div
                                        className={`ml-1 w-3 h-3 border border-transparent rounded-full`}
                                        style={{backgroundColor: `${tag.color ? tag.color : "bg-slate-300"}`}}
                                    />
                                    <p className={"truncate ml-1"}>{tag.language}</p>
                            </span>

                            );
                        } else {
                            return (
                                <span
                                    key={`tag-search-${tag}`}
                                    className={[
                                        "min-w-25 w-25 max-w-25 h-8 md:w-40 md:max-w-40 md:h-12 lg:text-2xl lg:justify-center lg:w-64 lg:max-w-64 lg:h-16 bg-(--accent-color) text-slate-200",
                                        "border-b border-r border-b-black border-r-black rounded-4xl px-3 py-2",
                                        "flex items-center"
                                    ].join(" ")}
                                    onClick={() => removeSearchTags(tag)}
                                >
                                <p className={"truncate"}>{tag}</p>
                            </span>
                            );
                        }
                    }
                })
                }
            </section>
            }
        </section>
    )
}

export default ProjectsSearch;