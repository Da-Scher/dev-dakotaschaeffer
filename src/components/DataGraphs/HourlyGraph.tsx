import React, {useEffect, useState} from 'react';
import { Chart } from 'react-chartjs-2';
import type {ChartData, ChartOptions} from 'chart.js/auto';
import './HourlyGraph.css';
import {useProjectsContext} from "../../context/useProjectsContext";
import type {CommitActivity} from "../../types/commit";
import {pluginHourlyGraph} from "./customChartBackgrounds";

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

function averageHourlyActivity(activities: CommitActivity[] | undefined, chartYHeight: number): number[] {
    const DAYS: number = 364;
    const hourlyTotals: number[] = Array<number>(24).fill(0);
    // Exit if activities is not yet defined.
    if (!activities) return new Array<number>(24).fill(0);
    // Set start date
    const startDate: Date = new Date();
    // Convert to midnight.
    startDate.setHours(0, 0, 0, 0);
    // Rewind 363 days (midnight of 364 days ago.)
    startDate.setDate(startDate.getDate() - DAYS - 1);

    for (const activity of activities) {
        const date: Date = new Date(activity.authoredAt);
        if (
            Number.isNaN(date.getTime()) ||
            date < startDate ||
            date > new Date()
        ) continue;
        hourlyTotals[date.getHours()] += 1;
    }

    const hourlyAverage: number[] = hourlyTotals.map<number>(
        (commitCount: number): number => commitCount / DAYS
    );
    const maximum: number = Math.max(...hourlyAverage);
    if (maximum === 0) {
        return chartYHeight === 0
            ?   hourlyAverage
            :   hourlyAverage.map<number>((average: number) => average * chartYHeight);
    }
    return chartYHeight === 0
        ?   hourlyAverage.map<number>((average: number) => average / maximum)
        :   hourlyAverage.map<number>((average: number) => (average / maximum) * chartYHeight);
}

function activityToday(activities: CommitActivity[] | undefined): number[] {
    if (!activities) return new Array<number>(24).fill(0);
    //console.log(activities);
    const currentTime: Date = new Date();
    const startDate: Date = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 0);
    return activities.reduce<number[]>(
        (hourlyActivity: number[], activity: Activity): number[] => {
            const date = new Date(activity.authoredAt);

            if (Number.isNaN(date.getTime())) {
                return hourlyActivity;
            }
            if (date.getTime() < startDate.getTime()) {
                return hourlyActivity;
            }
            const hour: number = date.getHours();
            hourlyActivity[hour] += 1;

            return hourlyActivity;
        }, Array<number>(24).fill(0)
    );
}

function HourlyGraph(): React.JSX.Element {
    const [fontSize, setFontSize] = useState<number>(12);
    const [tooltipFontSize, setTooltipFontSize] = useState<number>(12);
    const [pointRadius, setPointRadius] = useState<number>(3);
    const [tickSize, setTickSize] = useState<number>(6);
    useEffect(
        () => {
            const handlePointRadiusResize = () => {
                if (window.screen.width > 2559) {
                    setPointRadius(9);
                }
                else {
                    setPointRadius(3);
                }
            }
            const handleTextResize = () => {
                if (window.screen.width > 2259) {
                    setTickSize(18);
                    setTooltipFontSize(48);
                }
                else if (window.screen.width > 1439) {
                    setFontSize(36);
                    setTickSize(18);
                    setTooltipFontSize(32);
                } else if (window.screen.width > 1023) {
                    setFontSize(24);
                    setTickSize(12);
                    setTooltipFontSize(20);
                } else {
                    setFontSize(12);
                    setTickSize(12);
                    setTooltipFontSize(16);
                }
            }

            handlePointRadiusResize();
            handleTextResize();

            window.addEventListener('resize', handleTextResize);
            window.addEventListener('resize', handlePointRadiusResize);
            return () => {
                window.removeEventListener('resize', handleTextResize);
                window.removeEventListener('resize', handlePointRadiusResize);
            }
        },
        []
    )
    const {
        filteredCommits
    } = useProjectsContext();
    const hourlyAccumulative: number[] = activityToday(filteredCommits);
    const hourlyAverage: number[] = averageHourlyActivity(filteredCommits, Math.max(...hourlyAccumulative));
    console.log(hourlyAverage);
    const data: ChartData<"bar" | "line", number[], string> = {
        labels: HOUR_LABELS,
        datasets: [
            {
                label: "Hourly Average (Commits)",
                data: hourlyAverage,
                type: "line",
                pointBackgroundColor: "#35a3ac",
                backgroundColor: "#34C759",
                hoverBackgroundColor: "#289c44",
                pointRadius: pointRadius,
                pointHoverRadius: pointRadius + Math.floor(pointRadius / 3),
                pointHitRadius: pointRadius + Math.floor(pointRadius / 3),
            },
            {
                label: "Hourly Accumulative (Commits)",
                data: hourlyAccumulative,
                backgroundColor: "#9dada2",
                hoverBackgroundColor: "#849187",
                borderColor: "#FFFFFF",
                borderRadius: 4,
                borderSkipped: false,
            }
        ]
    };
    const options: ChartOptions<"bar" | "line"> = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 300,
        },
        layout: {
            padding: {
                left: 20,
                right: 20,
            }
        },
        plugins: {
            pluginHourlyGraph: {
                backgroundColor: '#9c9080',
            },
            legend: {
                display: false,
                labels: {
                    color: "#f3f4f6",
                },
            },
            tooltip: {
                backgroundColor: "#030712",
                titleColor: "#f9fafb",
                bodyColor: "#d1d5db",
                borderColor: "#4b5563",
                bodyFont: {
                    size: tooltipFontSize,
                },
                titleFont: {
                    size: tooltipFontSize,
                },
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
                    text: "Commits of Today",
                    color: "#f3f4f6",
                    font: {
                        size: fontSize,
                    }
                },
                grid: {
                    display: false,
                },
                ticks: {
                    color: "#d1d5db",
                    autoSkip: false,
                    maxRotation: 0,
                    font: {
                        size: tickSize,
                    },
                    callback(_value, index) {
                        return window.screen.width >= 768
                            ?   window.screen.width >= 2560
                                ?   `${HOUR_LABELS[index]}`
                                :   (index % 3 === 0
                                    ?   `${HOUR_LABELS[index]}`
                                    :   "")
                            :   (index % 6 === 0
                                ?   `${HOUR_LABELS[index]}`
                                :   "");
                    },
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: false,
                    //color: "#f3f4f6",
                    //text: "Commits",
                },
                ticks: {
                    display: false,
                    //color: "#d1d5db",
                    //precision: 0,
                },
            },
        },

    };
    return (
        <div
            className="hourly-graph-container"
        >
            <figure
                className="hourly-graph"
            >
                <Chart<"bar"|"line", number[], string> type={"bar"} className={"rounded-4xl p-4"} data={data} options={options} plugins={[pluginHourlyGraph]} />
            </figure>
        </div>
    );
}

export default HourlyGraph;