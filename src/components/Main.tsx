import React, {useState, useEffect} from "react";
import "./mainStyle.css";
import Projects from "./Projects";
import About from "./About";
import Pips from "./Pips";
import type {CommitActivityResponse} from "../types/commit";
import {getCommitActivity} from "../services/commitActivity";

function Main(): React.JSX.Element {
    /* Start getting the commit activity now since Projects and Pips will need it. */
    const [activityResponse, setActivityResponse] = useState<CommitActivityResponse | null>(null);
    // run immediately
    useEffect(() => {
        getCommitActivity()
            .then(setActivityResponse)
            .catch((error: unknown) => {
                console.error(`Could not load commit activity: ${error}`);
            });
    }, []);

    return (
        <main className={"grid grid-rows-[content-min_3fr] gap-1 overflow-visible"}>
            <Projects commitActivityResponse={activityResponse} />
            <About />
            <Pips commitActivityResponse={activityResponse}/>
        </main>
    );
}

export default Main;