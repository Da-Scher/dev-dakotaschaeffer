import React from "react";
import type { CSSProperties } from "react";
import type {CommitActivity, CommitActivityResponse} from "../types/commit";
import Pip from "./Pip";


const COLUMN_COUNT: number = 52;
const ROW_COUNT: number = 7;
const CELL_COUNT: number = COLUMN_COUNT * ROW_COUNT;


interface BoxGridProps {
    cellSize?: number;
    gap?: number;
    selectCA: (caList: CommitActivity[]) => void;
    commitActivityResponse: CommitActivityResponse | null;
}

interface CommitMap {
    commitActivities: CommitActivity[];
    daysAgo: number;
}

function startOfLocalDay(date: Date): Date {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}

/*function getPipClass(count: number): string {
    if (count === 0) return "bg-transparent!";
    if (count <=  2) return "bg-green-900!";
    if (count <=  5) return "bg-green-700!";
    if (count <=  9) return "bg-green-500!";
    return "bg-green-300";
}*/

function getDaysAgo(dateString: string, today: Date): number {
    const commitDate: Date = startOfLocalDay(new Date(dateString));
    const currentDate:Date = startOfLocalDay(today);

    const milisecondsPerDay: number = 24 * 60 * 60 * 1000;

    return Math.round(
        (currentDate.getTime() - commitDate.getTime()) / milisecondsPerDay,
    );
}

function BoxGrid({
        cellSize = 12,
        gap = 3,
        selectCA,
        commitActivityResponse,
    }: BoxGridProps): React.JSX.Element {
    const today: Date = new Date();
    if (!commitActivityResponse) {
        return <p>Loading activities...</p>;
    }
    const commits: CommitActivity[] = commitActivityResponse.commits



    const commitsByIndex: Map<number, CommitMap> = new Map<number, CommitMap>();

    for (let d: number = 0; d < 365; d++) commitsByIndex.set(d, {commitActivities: [], daysAgo: 364 - d})
    if(commits !== undefined) {
        commits.map((c: CommitActivity): void => {
            const daysAgo: number = getDaysAgo(c.authoredAt, today);
            if (daysAgo < 0 || daysAgo >= CELL_COUNT) {
                return;
            }
            const index: number = CELL_COUNT - 1 - daysAgo;
            const commit: CommitMap | undefined = commitsByIndex.get(index);
            if (commit === undefined) {
                commitsByIndex.set(index, {commitActivities: [c], daysAgo: daysAgo})
            } else {
                commit.commitActivities.push(c);
            }
        })
        //for (const c of commits) {
        //    //console.log(c)
        //
        //}
    }

    const gridStyle: CSSProperties = {
        gridTemplateColumns: `repeat(${COLUMN_COUNT}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${ROW_COUNT}, ${cellSize}px)`,
        gap: `${gap}px`,
    };



    return (
        <div className="absolute h-fit w-full overflow-visible pb-2 content-center">
            <div
                aria-hidden="true"
                className="mx-auto grid w-max grid-flow-col"
                style={gridStyle}
            >
                {Array.from({ length: CELL_COUNT }, (_, index) => {
                    const column: number = Math.floor(index / ROW_COUNT);
                    const row: number = index % ROW_COUNT;
                    const commit: CommitMap | undefined = commitsByIndex.get(index);
                    //console.log(commit)
                    return (
                        <Pip
                            key={`${column}-${row}`}
                            data-column={column}
                            data-row={row}
                            commitActivity={commit?.commitActivities ?? []}
                            daysAgo={commit?.daysAgo}
                            selectCA={selectCA}
                        />
                        /*
                        <div
                            key={`${column}-${row}`}
                            data-column={column}
                            data-row={row}
                            className={[
                                "box-border h-full w-full border-solid bg-transparent",
                                "transition-colors duration-200",
                                getPipClass(count),
                            ].join(' ')}
                                style={cellStyle}
                        />
                        */
                    );
                })}
            </div>
        </div>
    );
}

export default BoxGrid;