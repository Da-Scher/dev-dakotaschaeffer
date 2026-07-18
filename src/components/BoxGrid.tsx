import React from "react";
import type { CSSProperties } from "react";

const COLUMN_COUNT = 52;
const ROW_COUNT = 7;
const CELL_COUNT = COLUMN_COUNT * ROW_COUNT;

interface BoxGridProps {
    cellSize?: number;
    gap?: number;
    edgeWidth?: number;
    edgeColor?: string;
}

function BoxGrid({
        cellSize = 12,
        gap = 3,
        edgeWidth = 1,
        edgeColor = "#71717a",
    }: BoxGridProps): React.JSX.Element {
    const gridStyle: CSSProperties = {
        gridTemplateColumns: `repeat(${COLUMN_COUNT}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${ROW_COUNT}, ${cellSize}px)`,
        gap: `${gap}px`,
    };

    const cellStyle: CSSProperties = {
        borderWidth: `${edgeWidth}px`,
        borderColor: edgeColor,
    };

    return (
        <div className="w-full overflow-x-auto pb-2">
            <div
                aria-hidden="true"
                className="mx-auto grid w-max grid-flow-col"
                style={gridStyle}
            >
                {Array.from({ length: CELL_COUNT }, (_, index) => {
                    const column = Math.floor(index / ROW_COUNT);
                    const row = index % ROW_COUNT;

                    return (
                        <div
                            key={`${column}-${row}`}
                            data-column={column}
                            data-row={row}
                            className="box-border h-full w-full border-solid bg-transparent"
                            style={cellStyle}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default BoxGrid;