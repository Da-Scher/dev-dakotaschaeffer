import React from "react";
//import type { ProgrammingLanguage } from "../types/programlanguages";
import type { CommitActivity } from "../types/commit";
import { ProjectsContext } from "./ProjectsContext";
import type {LanguageSlice} from "../components/DataGraphs/LanguagePieChart";
import type {ProgrammingLanguage} from "../types/programlanguages";

interface ProjectsProviderProps {
    commits: CommitActivity[];
    children: React.ReactNode;
}

export function ProjectsProvider(props: ProjectsProviderProps) {
    const {commits, children} = props;
    const [selectedLanguages, setSelectedLanguages] = React.useState<Set<LanguageSlice>>(() => new Set());
    const [searchTags, setSearchTags] = React.useState<Set<string>>(() => new Set());
    const [eventPieChartToggle, setEventPieChartToggle] = React.useState<string>("");

    function removeSearchTags(tag: string): void {
        setSearchTags((prevTags: Set<string>) => {
            const next = new Set(prevTags);
            if(next.has(tag)) {
                next.delete(tag);
            }
            return next;
        });
    }

    function addSearchTags(text: string) {
        setSearchTags((prevTags: Set<string>) => {
            const next = new Set(prevTags);
            if (!next.has(text)) {
                next.add(text)
            }
            return next;
        })
    }
    function toggleSlice(language: LanguageSlice | string) {
        setSelectedLanguages((previous: Set<LanguageSlice>): Set<LanguageSlice> => {
            const next = new Set(previous);
            const slices: LanguageSlice[] = [...previous.values()];
            const languages: ProgrammingLanguage[] = slices.map((slice) => (slice.language as ProgrammingLanguage))

            if (typeof language !== "string" && languages.includes(language.language as ProgrammingLanguage)) {
                for (const slice of next)
                    if (slice.language === language.language) {
                        next.delete(slice);
                        setEventPieChartToggle("");
                    }
            }
            else if(typeof language !== "string" && !languages.includes(language.language as ProgrammingLanguage)) {
                next.add(language);
            }
            else if(typeof language === "string" && languages.includes(language as ProgrammingLanguage)) {
                for (const slice of next)
                    if (slice.language === language) {
                        next.delete(slice);
                        setEventPieChartToggle("");
                    }
            }
            else if(typeof language === "string" && !languages.includes(language as ProgrammingLanguage)) {
                console.log("attempting to call from pie-chart and try again.")
                setEventPieChartToggle(language)
                console.log(eventPieChartToggle)
                return previous;
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
                        return language.language in commit.languageStats.stats;
                    }
                    return false;
                })
            );
        }
        else if (selectedLanguages.size > 0 && searchTags.size > 0) {
            return commits.filter((commit) =>
                [...selectedLanguages].every((language) => {
                    if (commit.languageStats) {
                        return language.language in commit.languageStats.stats;
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
            toggleSlice,
            addSearchTags,
            removeSearchTags,
            clearTags,
            eventPieChartToggle,
        }), [commits, filteredCommits, selectedLanguages, searchTags, eventPieChartToggle]
    );

    return (
        <ProjectsContext.Provider value={value}>
            {children}
        </ProjectsContext.Provider>
    )
}