import React from "react";
import type {CommitActivity} from "../types/commit";

interface BoxActivityDetailsProps {
    commits: CommitActivity[];
    closeSidebarCB: () => void;
}

function BoxActivityDetails({commits, closeSidebarCB}: BoxActivityDetailsProps): React.JSX.Element {
    const [closing, setClosing] = React.useState(false);
    const isClosing = () => {
        setClosing(true)
        closeSidebarCB()
    }
    const date: Date = new Date(commits[0]?.authoredAt);
    const dateString = date.toLocaleDateString("en-US");
    return(
        <div className={"absolute top-0 left-0 w-full h-fit"}>
            {/* at the top: the date and an x button at the top right */}
            <header
                className={[
                    "relative flex flex-row flex-auto px-2 grow"
                ].join(' ')}
            >
                <span>
                    <h3>{dateString}</h3>
                </span>
                <span
                    className={"relative w-6 h-6 ml-auto"}
                >
                    <button
                        type="button"
                        aria-label={"Close commit menu"}
                        onClick={isClosing}
                        className={[
                            "absolute flex shrink-0 items-center align-middle justify-center",
                            "h-6 w-6",
                            "text-current transition-colors border-2 border-r-2 border-gray-200 dark:border-gray-300",
                            "focus-visible:outline-2 focus-visible:outline-offset-2",
                            "focus-visible:outline-current",
                        ].join(" ")}
                    >
                        <span className={"sr-only"}>
                            Close commit menu
                        </span>
                        <span
                            aria-hidden={"true"}
                            className={[
                                "relative w-0.5 h-3 bg-current",
                                "transition-transform duration-200 ease-in-out",
                                "motion-reduce:transition-none",
                                closing
                                    ? "rotate-0"
                                    : "rotate-45 translate-x-1/2",
                            ].join(" ")}
                        />
                        <span
                            aria-hidden={"true"}
                            className={[
                                "relative w-0.5 h-3 bg-current",
                                "transition-transform duration-200 ease-in-out",
                                "motion-reduce:transition-none",
                                closing
                                    ? "rotate-0"
                                    : "-rotate-45 -translate-x-1/2",
                            ].join(" ")}
                        />

                    </button>
                </span>
            </header>
            <main>
                <table className={"text-xs"}>
                    <colgroup>
                        <col className="w-10" />
                        <col className="w-20" />
                        <col className="w-10" />
                        <col className="w-10" />
                    </colgroup>
                    <thead>
                        <tr>
                            <td className="text-center">Repo</td>
                            <td className="text-center">Message</td>
                            <td className="text-center">Time</td>
                            <td className="text-center">Link</td>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            commits.length > 0 && (
                                commits.map((commit: CommitActivity) => {
                                    const caAT: Date = new Date(commit.authoredAt);
                                    const repo: string = commit.repo;
                                    const mesg: string = commit.message;
                                    const time: string = caAT.getHours() + ":" + caAT.getMinutes() + ":" + caAT.getSeconds();
                                    const link: string = commit.url;
                                    return (
                                        <tr>
                                            <td className="text-center">{repo}</td>
                                            <td className="text-center">{mesg}</td>
                                            <td className="text-center">{time}</td>
                                            <td className="text-center">{link}</td>
                                        </tr>
                                    );
                                })
                            )
                        }
                    </tbody>
                </table>
            </main>
        </div>
    );
}

export default BoxActivityDetails;