import React from "react";
import BoxGrid from "./BoxGrid";

function Pips(): React.JSX.Element {
    return (
        <div className={"border-2 bg-gray-400 text-black border-gray-100 rounded-2xl grid grid-rows-[content-minmax_1fr] gap-1"}>
            <h2 className={"row-start-1 row-end-2"}>Mixed Repository Activity</h2>
            <div className="row-start-2 col-start-1 row-end-3 col-end-2 w-full m-2">
                <BoxGrid />
            </div>
        </div>
    );
}

export default Pips;