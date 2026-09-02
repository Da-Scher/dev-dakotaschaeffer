import React, {useMemo} from 'react';
import { Bar } from 'react-chartjs-2';
import type {ChartData, ChartOptions} from 'chart.js/auto';
import './WeeklyGraph.css';
import type {CommitActivity} from "../../types/commit";
import {useLanguageStatistics} from "./useLanguageStatistics";

const WEEK_LABELS: string[] = Array.from(
    {length: 7},
    (_, day) =>
        new Intl.DateTimeFormat(undefined, {
            weekday: "short",
        }).format(new Date(2026, 0, 4 + day))
);

function countActivityByDayOfWeek(activities: CommitActivity[]): number[] {
    return activities.reduce<number[]>(
        (dailyActivity: number[], activity: CommitActivity): number[] => {
            const date = new Date(activity.authoredAt);

            if (Number.isNaN(date.getTime())) {
                return dailyActivity;
            }
            const day: number = date.getDay();
            dailyActivity[day] += 1;
            return dailyActivity;
        }, Array<number>(7).fill(0)
    );
}

function WeeklyGraph(): React.JSX.Element {
    const { filteredCommits } = useLanguageStatistics();
    const weeklyGraphData: number[] = useMemo((): number[] => countActivityByDayOfWeek(filteredCommits), [filteredCommits]);

    const data: ChartData<"bar", number[], string> = {
        labels: WEEK_LABELS,
        datasets: [
            {
                label: "Commits",
                data: weeklyGraphData,
                backgroundColor: "#22c55e",
                hoverBackgroundColor: "#4ade80",
                borderColor: "#16a43a",
                borderRadius: 4,
                borderSkipped: false,
            }
        ],
    };
    const options: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 300,
        },
        plugins: {
            legend: {
                labels: {
                    color: "#f3f4f6",
                },
            },
            tooltip: {
                backgroundColor: "#030712",
                titleColor: "#f9fafb",
                bodyColor: "#d1d5db",
                borderColor: "#4b5563",
                borderWidth: 1,
                callbacks: {
                    title: ([item]) =>
                        item?.label ?? "",
                    label: (context) => {
                        const count = context.parsed.y;
                        return `${count} ${count === 1 ? "commit" : "commits"}`;
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Day of the week",
                    color: "#f3f4f6",
                },
                grid: {
                    display: false,
                },
                ticks: {
                    color: "#d1d5db",
                    autoSkip: false,
                    maxRotation: 0,
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    color: "#f3f4f6",
                    display: true,
                    text: "Commits",
                },
                ticks: {
                    color: "#d1d5db",
                    precision: 0,
                },
            }
        },
    };
    return (
        <div
            className={"activity-chart"}>
            <figure
                className={"weekly-graph-container activity-chart__canvas"}
            >
                <Bar data={data} options={options} />
            </figure>
        </div>
    );
}

export default WeeklyGraph;