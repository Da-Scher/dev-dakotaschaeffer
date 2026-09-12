import React from "react";
import LanguagePieChart from "./DataGraphs/LanguagePieChart";
import "./languageStats.css";
import HourlyGraph from "./DataGraphs/HourlyGraph";
import WeeklyGraph from "./DataGraphs/WeeklyGraph";

function ProjectsLanguageStats(): React.JSX.Element {

    return (
        <div
            className={"language-stats"}
        >
            <HourlyGraph />
            <WeeklyGraph />
            <LanguagePieChart />
        </div>
    );
}

export default ProjectsLanguageStats;