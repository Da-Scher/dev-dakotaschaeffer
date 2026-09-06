import React from "react";
import {useProjectsContext} from "../context/useProjectsContext";
import type {NormalizedLanguageStats} from "../types/programlanguages";
import type {CommitActivity, ReadmeData} from "../types/commit";
import {calculateLanguageStats} from "./DataGraphs/LanguagePieChartHelper";
import ProjectLanguagePieChart from "./DataGraphs/ProjectLanguagePieChart";
import Project from "./Project";


interface ProjectItem {
    repo: string;
    latestCommit: string;
    languageStats: NormalizedLanguageStats | undefined;
}

function ProjectList (): React.JSX.Element {
    // Get necessary context for Projects
    const {filteredCommits, readmes} = useProjectsContext();
    const commitActivityForEachRepo = new Map<string, CommitActivity[]>();
    const languageStatsForEachRepo = new Map<string, NormalizedLanguageStats>();
    const latestCommitForEachRepo = new Map<string, CommitActivity>();

    if (!filteredCommits) {
        return <p>Loading commits...</p>;
    }
    for (const commit of filteredCommits) {
        const commitActivityForRepo: CommitActivity[] | undefined = commitActivityForEachRepo.get(commit.repo);
        if (commitActivityForRepo === undefined) {
            commitActivityForEachRepo.set(commit.repo, [commit]);
        }
        else {
            commitActivityForEachRepo.set(commit.repo, commitActivityForRepo.concat(commit));
        }
    }



    const projectsList: ProjectItem[] = ((): ProjectItem[] => {
        if (filteredCommits) {
            for (const commit of filteredCommits) {
                const currentOldestCommit: CommitActivity | undefined = latestCommitForEachRepo.get(commit.repo);
                if (currentOldestCommit === undefined || new Date(commit.authoredAt).getTime() > new Date(currentOldestCommit.authoredAt).getTime()) {
                    latestCommitForEachRepo.set(commit.repo, commit);
                }
            }

            const latestCommitsList: CommitActivity[] = Array.from(latestCommitForEachRepo.values()).sort(
                (a: CommitActivity, b: CommitActivity): number =>
                    new Date(b.authoredAt).getTime() - new Date(a.authoredAt).getTime()
            );
            for (const repoCommits of commitActivityForEachRepo) {
                const repo: string = repoCommits[1][0].repo;
                const languageStatsForRepo: NormalizedLanguageStats | undefined = languageStatsForEachRepo.get(repo);
                if (languageStatsForRepo === undefined) {
                    languageStatsForEachRepo.set(repo, calculateLanguageStats(repoCommits[1]))
                }
                else {
                    console.warn("This should only ever happen once. If you are seeing this message then there was a second go in a repo. Check for strangeness.")
                    break;
                }
            }

            return latestCommitsList.map<ProjectItem>((commit: CommitActivity): ProjectItem => {
                return { repo: commit.repo, latestCommit: commit.authoredAt, languageStats: languageStatsForEachRepo.get(commit.repo) };
            });
        }
        else {
            return [];
        }
    })();
    // order of appearance:
    // start with 3 latest projects.
    // then 3 latest projects with some qualifier: programs with language, name, etc.

    // each project should have a description, then a name, then a date, and the first 5 lines from the README.md.
    return (
        <div>
            {
                projectsList.map((project: ProjectItem): React.JSX.Element => {
                    const readme: ReadmeData | undefined = readmes.find((readme: ReadmeData) => readme.repo === project.repo);
                    return (
                        <Project project={project.languageStats} Name={project.repo} When={project.latestCommit} Readme={readme}/>
                    );
                })
            }
        </div>
    );
}

export default ProjectList;