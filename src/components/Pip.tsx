import React, {useState} from "react";
import type {CommitActivity} from "../types/commit";

type PipProps = {
    commitActivity: CommitActivity[];
    daysAgo: number | undefined;
    selectCA: (caList: CommitActivity[]) => void;
};

function pipFillColorByCommitCount(count: number): string {
    if (count === 0) return "bg-transparent!";
    if (count <=  2) return "bg-green-900!";
    if (count <=  5) return "bg-green-700!";
    if (count <=  9) return "bg-green-500!";
    return "bg-green-300!";
}

function label(commits: number, days: number | undefined): string {
    if (days === undefined) return "flabbergasted.";
    const c: string = commits === 1 ? `1 commit ` : `${commits} commits `;
    if (days === 1) return (
        c + "today"
    );
    else return (
        c + (days === 2 ? `1 day ago` : `${days - 1} days ago`)
    );
}

function PipDetails(props: {commitList: CommitActivity[]}): React.JSX.Element {
    const commitsByRepo: Map<string, CommitActivity[]> = new Map<string, CommitActivity[]>()

    if (props.commitList === undefined) {
        return (
            <div
                role="tooltip"
                className={[
                    "relative bottom-full left-1/2 z-50 mb-2",
                    "w-max -translate-x-1/2",
                    "rounded-md border border-zinc-700 overflow-visible",
                    "bg-zinc-950 px-3 py-2",
                    "text-sm text-zinc-100 shadow-lg"
                ].join(" ")}
            >
                <p></p>
            </div>
        )
    }
    for (const commit of props.commitList) {
        //console.log(commit);
        const repo: string = commit.repo;
        const commitRepo: CommitActivity[] | undefined = commitsByRepo.get(repo);
        if (commitRepo === undefined) {
            commitsByRepo.set(repo, [commit])
        }
        else {
            commitRepo.push(commit);
        }
    }

    return (
        <div
            role="tooltip"
            className={[
                "absolute bottom-full left-1/2 mb-2",
                "w-max -translate-x-1/2",
                "rounded-md border border-zinc-700 overflow-visible",
                "bg-zinc-950 px-3 py-2",
                "text-sm text-zinc-100 shadow-lg"
            ].join(" ")}
        >
            { Array.from(commitsByRepo.entries()).map(([repo, commits]: [string, CommitActivity[]]): React.JSX.Element => {
                //console.log("repo => ", repo);
                return (
                    <div key={repo}>
                        <p>{repo} ({commits.length})</p>
                        {
                            commits.map((commit) => {
                                return (
                                    <div key={commit.url}>
                                        <a href={commit.url}>{commit.sha} {commit.authoredAt}</a><br />
                                    </div>
                                )
                            })
                        }
                    </div>
                )
            })}
        </div>
    )
}

function Pip ({commitActivity, daysAgo, selectCA}: PipProps): React.JSX.Element {
    const [hovered, setHovered] = useState(false);
    const commits: CommitActivity[] = commitActivity
    const commitCount: number = commits?.length ?? 0
    function handleSelectCA(commits: CommitActivity[]): void {
        selectCA(commits)
    }
    return (
        <div
            aria-label={
            label(commitCount, daysAgo)
            }
            className={[
                "size-3 border border-zinc-500",
                "transition-transform duration-150",
                "hover:scale-125 focus-visible:scale-125",
                pipFillColorByCommitCount(commitCount)
            ].join(' ')}

            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
            onClick={() => handleSelectCA(commits)}
        >
            {hovered &&
                <PipDetails commitList={commits}/>
            }
        </div>
    )
}

export default Pip;