import React from "react";
import type { ProgrammingLanguage } from "../types/programlanguages";
import type { CommitActivity } from "../types/commit";
import { ProjectsContext } from "./ProjectsContext";

interface LanguageStatisticsProviderProps {
    commits: CommitActivity[];
    children: React.ReactNode;
}

export function ProjectsProvider(props: LanguageStatisticsProviderProps) {
    const {commits, children} = props;
    const [selectedLanguages, setSelectedLanguages] = React.useState<Set<ProgrammingLanguage>>(() => new Set());

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

    function clearLanguages() {
        setSelectedLanguages(new Set());
    }

    const filteredCommits = React.useMemo(() => {
        if (selectedLanguages.size === 0) {
            return commits;
        }
        return commits.filter((commit) =>
            [...selectedLanguages].every((language) => {
                if (commit.languageStats) {
                    return language in commit.languageStats.stats
                }
                return false;
            }),
        )
    }, [commits, selectedLanguages]);

    const value = React.useMemo(
        () => ({
            commits,
            filteredCommits,
            selectedLanguages,
            toggleLanguage,
            clearLanguages,
        }), [commits, filteredCommits, selectedLanguages]
    );

    return (
        <ProjectsContext.Provider value={value}>
            {children}
        </ProjectsContext.Provider>
    )
}