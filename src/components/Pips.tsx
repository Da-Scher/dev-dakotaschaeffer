import React, {useState} from "react";
import BoxGrid from "./BoxGrid";
import type {CommitActivity, CommitActivityResponse} from "../types/commit";
import BoxActivityDetails from "./BoxActivityDetails";

interface PipsProps {
    commitActivityResponse: CommitActivityResponse | null;
}

function Pips({commitActivityResponse}: PipsProps): React.JSX.Element {
    const [selectedCommitActivity, setSelectedCommitActivity] = useState<CommitActivity[]>([]);
    const sidebarOpen: boolean = selectedCommitActivity.length > 0;
    function handleSelectCA(caList: CommitActivity[]): void {
        setSelectedCommitActivity(caList ?? []);
    }
    function handleCloseSidebar(): void {
        setSelectedCommitActivity([]);
    }
    function visibility(cond: boolean): string {
        if (cond) {
            return "visible"
        }
        return "invisible"
    }
    return (
        <div className={[
            "relative border-2 bg-gray-400 text-black border-gray-100 rounded-2xl",
            "grid grid-rows-[content-minmax_1fr] gap-1 w-full min-h-fit",
        ].join(" ")}>
            <h2 className={"row-start-1 row-end-2"}>Mixed Repository Activity</h2>
            <div className={[
                "relative row-start-2 col-start-1 row-end-3 col-end-2 w-full max-h-46 overflow-auto",
                sidebarOpen
                ? "h-46"
                : "h-28",].join(" ")}>

                <div
                    aria-hidden={sidebarOpen}
                    className={[
                        "relative",
                        visibility(!sidebarOpen),
                    ].join(' ')}
                >
                    <BoxGrid
                        selectCA={handleSelectCA}
                        commitActivityResponse={commitActivityResponse}
                    />
                </div>
                <div
                    aria-hidden={!sidebarOpen}
                    className={[
                        "static top-0 left-0 w-full h-max-46",
                        "bg-inherit",
                        visibility(sidebarOpen),
                    ].join(' ')}
                >
                    {
                        selectedCommitActivity && selectedCommitActivity.length > 0 &&
                        (<BoxActivityDetails commits={selectedCommitActivity} closeSidebarCB={handleCloseSidebar}/>)
                    }
                </div>

            </div>
        </div>
    );
}

export default Pips;