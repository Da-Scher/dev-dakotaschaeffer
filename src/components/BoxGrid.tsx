import React, {useEffect, useState} from "react";
import type { CSSProperties } from "react";
import {getCommitActivity} from "../services/commitActivity";
import type {CommitActivity, CommitActivityResponse} from "../types/commit";
import Pip from "./Pip";


const COLUMN_COUNT = 52;
const ROW_COUNT = 7;
const CELL_COUNT = COLUMN_COUNT * ROW_COUNT;


interface BoxGridProps {
    cellSize?: number;
    gap?: number;
    edgeWidth?: number;
    edgeColor?: string;
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
    const commitDate = startOfLocalDay(new Date(dateString));
    const currentDate = startOfLocalDay(today);

    const milisecondsPerDay: number = 24 * 60 * 60 * 1000;

    return Math.round(
        (currentDate.getTime() - commitDate.getTime()) / milisecondsPerDay,
    );
}

function BoxGrid({
        cellSize = 12,
        gap = 3,
    }: BoxGridProps): React.JSX.Element {
    const today = new Date();
    const [activity, setActivity] = useState<CommitActivityResponse | null>(null);
    useEffect(() =>{
        getCommitActivity()
            .then(setActivity)
            .catch((error: unknown) => {
                console.error(`Could not load commit activity: ${error}`);
            });
    }, []);

    if (!activity) {
        return <p>Loading activities...</p>;
    }

    const commitsByIndex: Map<number, CommitActivity[]> = new Map<number, CommitActivity[]>();

    for (const c of activity.commits) {
        console.log(c)
        const daysAgo = getDaysAgo(c.authoredAt, today);

        if (daysAgo < 0 || daysAgo >= CELL_COUNT) {
            continue;
        }

        const index: number = CELL_COUNT - 1 - daysAgo;
        const commit: CommitActivity[] | undefined = commitsByIndex.get(index);
        if (commit === undefined) {
            commitsByIndex.set(index, [c])
        }
        else {
            commit.push(c);
        }
    }

    const gridStyle: CSSProperties = {
        gridTemplateColumns: `repeat(${COLUMN_COUNT}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${ROW_COUNT}, ${cellSize}px)`,
        gap: `${gap}px`,
    };



    return (
        <div className="w-full overflow-visible pb-2">
            <div
                aria-hidden="true"
                className="mx-auto grid w-max grid-flow-col"
                style={gridStyle}
            >
                {Array.from({ length: CELL_COUNT }, (_, index) => {
                    const column = Math.floor(index / ROW_COUNT);
                    const row = index % ROW_COUNT;

                    const commit: CommitActivity[] | undefined = commitsByIndex.get(index);
                    console.log(commit)
                    return (
                        <Pip
                            key={`${column}-${row}`}
                            data-column={column}
                            data-row={row}
                            commits={commit}
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