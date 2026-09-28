import React from "react";
import {useProjectsContext} from "../context/useProjectsContext";
import type {NormalizedLanguageStats} from "../types/programlanguages";
import type {CommitActivity, ReadmeData} from "../types/commit";
import {calculateLanguageStats} from "./DataGraphs/LanguagePieChartHelper";
//import ProjectLanguagePieChart from "./DataGraphs/ProjectLanguagePieChart";
import Project from "./Project";


interface ProjectItem {
    repo: string;
    latestCommit: string;
    languageStats: NormalizedLanguageStats | undefined;
}

function ProjectList (): React.JSX.Element {
    // Get necessary context for Projects
    const {filteredCommits, readmes} = useProjectsContext();
    const [projectIndex, setProjectIndex] = React.useState<number>(0);
    const commitActivityForEachRepo = new Map<string, CommitActivity[]>();
    const languageStatsForEachRepo = new Map<string, NormalizedLanguageStats | undefined>();
    const latestCommitForEachRepo = new Map<string, CommitActivity>();

    if (!filteredCommits) {
        return <p>Loading commits...</p>;
    }
    if (!readmes) {
        return <p>Loading readmes...</p>;
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

    const decreaseProjectIndex: () => void = (): void => {
        if (projectIndex < 3) return;
        switch (projectIndex % 3) {
            case 0: setProjectIndex(projectIndex - 3); break;
            case 1: setProjectIndex(projectIndex - 2); break;
            case 2: setProjectIndex(projectIndex - 1); break;
        }
    }
    const increaseProjectIndex: () => void = (): void => {
        if (projectIndex > projectsList.length - 3) return;
        switch (projectIndex % 3) {
            case 0: setProjectIndex(projectIndex + 3); break;
            case 1: setProjectIndex(projectIndex + 2); break;
            case 2: setProjectIndex(projectIndex + 1); break;
        }
    }
    // order of appearance:
    // start with 3 latest projects.
    // then 3 latest projects with some qualifier: programs with language, name, etc.

    projectsList.sort((a: ProjectItem, b: ProjectItem): number =>
        new Date(b.latestCommit).getTime() - new Date(a.latestCommit).getTime()
    );

    const renderList: ProjectItem[] = [projectsList[projectIndex], projectsList[projectIndex + 1], projectsList[projectIndex + 2]];
    console.log(`render list`);
    console.log(renderList);
    // each project should have a description, then a name, then a date, and the first 5 lines from the README.md.
    return (
        <div
            className={[
                "flex flex-col gap-4",
                "bg-(--main-color) mx-4 p-4",
            ].join(' ')}
        >
            {
                renderList.flatMap((project: ProjectItem): React.JSX.Element[] => {
                    if (!project) return [];
                    const readme: ReadmeData | undefined = readmes.find((readme: ReadmeData): boolean => project && readme.repo === project.repo);
                    return [
                        <Project project={project.languageStats} Name={project.repo} When={project.latestCommit} Readme={readme}/>
                    ];
                })
            }
            <div
                className={"flex gap-4 w-full grow min-w-0 justify-center"}
            >
                <span
                    className={[
                        "h-0 w-0",
                        "border-r-32 border-t-16 border-b-16",
                        "border-t-transparent border-l-transparent border-b-transparent",
                         projectIndex === 0 ? "border-r-gray-400" : "border-r-black",
                    ].join(' ')}
                    onClick={() => decreaseProjectIndex()}
                />
                <span
                    className={"h-8 w-8 rounded-full bg-black"}
                />
                <span
                    className={[
                        "h-0 w-0",
                        "border-l-32 border-t-16 border-b-16",
                        "border-t-transparent border-r-transparent border-b-transparent",
                        projectIndex >= projectsList.length - 3 ? "border-l-gray-400" : "border-l-black",
                    ].join(' ')}
                    onClick={() => increaseProjectIndex()}
                />
            </div>
        </div>
    );
}

export default ProjectList;