import React from "react";

function ProjectsSearch(): React.JSX.Element {
    const [searchTags, setSearchTags] = React.useState<string[]>(["test"]);
    return (
        <form
            role={"search"}
            onSubmit={() => {}}
        >
            <label
                htmlFor={"projects-search"}
            >
                {
                    searchTags.length > 0
                    ? searchTags.map((tag) => (
                        <span
                            key={tag}
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
                value={""}
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