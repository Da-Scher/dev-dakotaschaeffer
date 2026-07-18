import React from "react";
import "./mainStyle.css";
import Projects from "./Projects";
import About from "./About";
import Pips from "./Pips";

function Main(): React.JSX.Element {
    return (
        <main>
            <Projects />
            <About />
            <Pips />
        </main>
    );
}

export default Main;