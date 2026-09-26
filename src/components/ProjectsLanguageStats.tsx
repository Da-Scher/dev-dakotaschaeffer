import React from "react";
import LanguagePieChart from "./DataGraphs/LanguagePieChart";
import "./languageStats.css";
import HourlyGraph from "./DataGraphs/HourlyGraph";
import WeeklyGraph from "./DataGraphs/WeeklyGraph";

function ProjectsLanguageStats(): React.JSX.Element {

    return (
        <div
            className={"language-stats grid grid-cols-2 grid-rows-2 gap-0 border-black h-80 lg:h-160"}
        >
            <HourlyGraph />
            <WeeklyGraph />
            <LanguagePieChart />
        </div>
    );
}

export default ProjectsLanguageStats;