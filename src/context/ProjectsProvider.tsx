import React, {useCallback, useReducer} from "react";
//import type { ProgrammingLanguage } from "../types/programlanguages";
import type {CommitActivity, ReadmeData} from "../types/commit";
import { ProjectsContext } from "./ProjectsContext";
import type {LanguageSlice} from "../components/DataGraphs/LanguagePieChart";
//import type {ProgrammingLanguage} from "../types/programlanguages";

interface ProjectsProviderProps {
    commits: CommitActivity[];
    readmes: ReadmeData[] | undefined;
    children: React.ReactNode;
}

type ProjectsSelection = {
    selectedLanguages: Set<LanguageSlice>;
    eventPieChartToggle: string;
}

type SelectionAction = {
    type: "toggleSlice";
    language: LanguageSlice | string;
}

function selectionReducer(
    state: ProjectsSelection,
    action: SelectionAction,
): ProjectsSelection {
    console.log(`selectionReducer(state = {selectedLanguages: ${state.selectedLanguages}, eventPieChartToggle: ${state.eventPieChartToggle}}, action = {type: ${action.type}, language: ${action.language}} Start.`);
    const input: LanguageSlice | string = action.language;
    const name: string = typeof input === "string" ? input : input.language;
    const existing: LanguageSlice | undefined = [...state.selectedLanguages].find(
        (slice) => slice.language === name,
    );
    console.count(`toggleSlice: ${typeof input === "string" ? input : input.language}`);
    console.log("selected before:", [...state.selectedLanguages].map(s => s.language));
    if (existing) {
        const selectedLanguages = new Set<LanguageSlice>(state.selectedLanguages);
        selectedLanguages.delete(existing);
        return { selectedLanguages, eventPieChartToggle: ""};
    }
    if (typeof input === "string") {
        return {...state, eventPieChartToggle: input};
    }
    const selectedLanguages = new Set<LanguageSlice>(state.selectedLanguages);
    selectedLanguages.add(input);
    return {...state, selectedLanguages};
}

export function ProjectsProvider(props: ProjectsProviderProps) {
    const {commits, children, readmes} = props;
    //const [selectedLanguages, setSelectedLanguages] = React.useState<Set<LanguageSlice>>(() => new Set());
    const [searchTags, setSearchTags] = React.useState<Set<string>>(() => new Set());
    //const [eventPieChartToggle, setEventPieChartToggle] = React.useState<string>("");

    function removeSearchTags(tag: string): void {
        setSearchTags((prevTags: Set<string>) => {
            const next = new Set(prevTags);
            if(next.has(tag)) {
                next.delete(tag);
            }
            return next;
        });
    }

    const [selection, dispatch] = useReducer(selectionReducer, {
        selectedLanguages: new Set<LanguageSlice>(),
        eventPieChartToggle: "",
    });

    function addSearchTags(text: string) {
        setSearchTags((prevTags: Set<string>) => {
            const next = new Set(prevTags);
            if (!next.has(text)) {
                next.add(text)
            }
            return next;
        })
    }
    const toggleSlice: (language: LanguageSlice | string) => void = useCallback((language: LanguageSlice | string): void => {
        dispatch({ type: "toggleSlice", language: language });
    }, []);

    const { selectedLanguages, eventPieChartToggle } = selection;


    function clearTags() {
        //setSelectedLanguages(new Set());
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
            readmes,
            filteredCommits,
            selectedLanguages,
            searchTags,
            toggleSlice,
            addSearchTags,
            removeSearchTags,
            clearTags,
            eventPieChartToggle,
        }), [commits, readmes, filteredCommits, selectedLanguages, searchTags, eventPieChartToggle, toggleSlice]
    );

    return (
        <ProjectsContext.Provider value={value}>
            {children}
        </ProjectsContext.Provider>
    )
}