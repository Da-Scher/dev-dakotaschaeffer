import React from 'react';
import { Bar } from 'react-chartjs-2';
import {Chart, BarController, BarElement} from 'chart.js/auto';
import type {ChartData, ChartOptions} from 'chart.js/auto';
import './HourlyGraph.css';
import {useLanguageStatistics} from "./useLanguageStatistics";
import type {CommitActivity} from "../../types/commit";

Chart.register(BarController, BarElement);

export interface Activity {
    authoredAt: string;
}

const HOUR_LABELS: string[] = Array.from(
    { length: 24 },
    (_, hour) =>
        new Intl.DateTimeFormat(undefined, {
            hour: 'numeric',
        }).format(new Date(2000, 0, 1, hour)),
);

function countActivityByHour(activities: CommitActivity[]): number[] {
    console.log(activities);
    return activities.reduce<number[]>(
        (hourlyActivity: number[], activity: Activity): number[] => {
            const date = new Date(activity.authoredAt);

            if (Number.isNaN(date.getTime())) {
                return hourlyActivity;
            }

            const hour: number = date.getHours();
            hourlyActivity[hour] += 1;

            return hourlyActivity;
        }, Array<number>(24).fill(0)
    );
}

function HourlyGraph(): React.JSX.Element {
    const {
        filteredCommits
    } = useLanguageStatistics();
    const activityByHour = React.useMemo(() => countActivityByHour(filteredCommits), [filteredCommits]);

    const data: ChartData<"bar", number[], string> = {
        labels: HOUR_LABELS,
        datasets: [
            {
                label: "Commits",
                data: activityByHour,
                backgroundColor: "#22c55e",
                hoverBackgroundColor: "#4ade80",
                borderColor: "#16a34a",
                borderRadius: 4,
                borderSkipped: false,
            }
        ]
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
                        const count = context.parsed.y
                        return `${count} ${count === 1 ? "commit" : "commits"}`
                    }

                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Hour of day",
                    color: "#f3f4f6",
                },
                grid: {
                    display: false,
                },
                ticks: {
                    color: "#d1d5db",
                    autoSkip: false,
                    maxRotation: 0,
                    callback(_value, index) {
                        return index % 3 === 0
                            ? `${HOUR_LABELS[index]}`
                            : "";
                    },
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
            },
        },
    };
    return (
        <div
        className="activity-chart"
        >
            <figure
                className="hourly-graph-container activity-chart__canvas"
            >
                <Bar data={data} options={options} />
            </figure>
        </div>
    );
}

export default HourlyGraph;