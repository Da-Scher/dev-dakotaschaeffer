import React from "react";
import "./mainStyle.css";
import Projects from "./Projects";
import About from "./About";
import Pips from "./Pips";

function Main(): React.JSX.Element {
    return (
        <main className={"grid grid-rows-[content-min_3fr] gap-1"}>
            <Projects />
            <About />
            <Pips />
        </main>
    );
}

export default Main;