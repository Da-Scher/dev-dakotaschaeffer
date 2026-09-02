import React from "react";
import type {CommitActivityResponse} from "../types/commit";
import LanguagePieChart from "./DataGraphs/LanguagePieChart";
import "./languageStats.css";
import HourlyGraph from "./DataGraphs/HourlyGraph";
import WeeklyGraph from "./DataGraphs/WeeklyGraph";
import {LanguageStatisticsProvider} from "./DataGraphs/LanguageStatisticsProvider";

export interface ProjectsLanguageStatsProps {
    commitActivityResponse: CommitActivityResponse | undefined;
}

function ProjectsLanguageStats(props: ProjectsLanguageStatsProps): React.JSX.Element {
    const {commitActivityResponse} = props;

    if (!commitActivityResponse) {
        return <p>Loading commit activities...</p>
    }

    return (
        <LanguageStatisticsProvider commits={commitActivityResponse.commits}>
            <div
                className={"language-stats"}
            >
                <HourlyGraph />
                <WeeklyGraph />
                <LanguagePieChart />
            </div>
        </LanguageStatisticsProvider>
    );
}

export default ProjectsLanguageStats;