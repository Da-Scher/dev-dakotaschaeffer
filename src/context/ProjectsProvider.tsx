import React from "react";
import type { ProgrammingLanguage } from "../types/programlanguages";
import type { CommitActivity } from "../types/commit";
import { ProjectsContext } from "./ProjectsContext";

interface ProjectsProviderProps {
    commits: CommitActivity[];
    children: React.ReactNode;
}

export function ProjectsProvider(props: ProjectsProviderProps) {
    const {commits, children} = props;
    const [selectedLanguages, setSelectedLanguages] = React.useState<Set<ProgrammingLanguage>>(() => new Set());
    const [searchTags, setSearchTags] = React.useState<Set<string>>(() => new Set());

    function addSearchTags(text: string) {
        setSearchTags((prevTags: Set<string>) => {
            const next = new Set(prevTags);
            if (!next.has(text)) {
                next.add(text)
            }
            return next;
        })
    }
    function toggleLanguage(language: ProgrammingLanguage) {
        setSelectedLanguages((previous) => {
            const next = new Set(previous);

            if (next.has(language)) {
                next.delete(language);
            }
            else {
                next.add(language);
            }
            return next;
        });
    }

    function clearTags() {
        setSelectedLanguages(new Set());
        setSearchTags(new Set());
    }

    const filteredCommits = React.useMemo(() => {
        console.log(`${selectedLanguages.size > 0} and ${searchTags.size > 0}`)
        if (selectedLanguages.size === 0 && searchTags.size === 0) {
            return commits;
        }
        else if (selectedLanguages.size === 0 && searchTags.size > 0) {
            return commits.filter((commit) =>
                [...searchTags].every((tag) => {
                    return commit.repo.includes(tag);

                })
            );
        }
        else if (selectedLanguages.size > 0 && searchTags.size === 0) {
            return commits.filter((commit) =>
                [...selectedLanguages].every((language) => {
                    if (commit.languageStats) {
                        return language in commit.languageStats.stats;
                    }
                    return false;
                })
            );
        }
        else if (selectedLanguages.size > 0 && searchTags.size > 0) {
            return commits.filter((commit) =>
                [...selectedLanguages].every((language) => {
                    if (commit.languageStats) {
                        return language in commit.languageStats.stats;
                    }
                    return false;
                })
            ).filter((commit) =>
                [...searchTags].every((tag) => {
                    return commit.repo.includes(tag);

                })
            );
        }
    }, [commits, selectedLanguages, searchTags]);

    const value = React.useMemo(
        () => ({
            commits,
            filteredCommits,
            selectedLanguages,
            searchTags,
            toggleLanguage,
            addSearchTags,
            clearTags,
        }), [commits, filteredCommits, selectedLanguages, searchTags]
    );

    return (
        <ProjectsContext.Provider value={value}>
            {children}
        </ProjectsContext.Provider>
    )
}