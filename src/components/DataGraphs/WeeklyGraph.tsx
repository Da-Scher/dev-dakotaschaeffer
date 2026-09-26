import React, {useEffect, useMemo, useState} from 'react';
import {Chart} from 'react-chartjs-2';
import type {ChartData, ChartOptions} from 'chart.js/auto';
import './WeeklyGraph.css';
import type {CommitActivity} from "../../types/commit";
import {useProjectsContext} from "../../context/useProjectsContext";
import {pluginWeeklyGraph} from "./customChartBackgrounds";

const WEEK_LABELS: string[] = Array.from(
    {length: 7},
    (_, day) =>
        new Intl.DateTimeFormat(undefined, {
            weekday: "short",
        }).format(new Date(2026, 0, 4 + day))
);

function averageActivityByDayOfWeek(activities: CommitActivity[] | undefined, chartYHeight: number): number[] {
    const WEEKS: number = 52;
    const weeklyTotals: number[] = Array<number>(7).fill(0);

    // Exit if activities is not yet defined.
    if (!activities) return new Array<number>(7).fill(0);

    // Define the start date at midnight of 364 days ago.
    const startDate: Date = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (WEEKS * 7));

    for (const activity of activities) {
        const date: Date = new Date(activity.authoredAt);
        if (
            Number.isNaN(date.getTime()) ||
            date < startDate ||
            date > new Date()
        ) continue;
        weeklyTotals[date.getDay()] += 1;
    }
    const weeklyAverage: number[] = weeklyTotals.map<number>(
        (commitCount: number): number => commitCount / WEEKS
    );
    const maximum: number = Math.max(...weeklyAverage);
    if (maximum === 0) {
        return chartYHeight === 0
            ?   weeklyAverage
            :   weeklyAverage.map<number>((average: number): number => average * chartYHeight);
    }

    return chartYHeight === 0
        ?   weeklyAverage.map<number>((average: number): number => average / maximum)
        :   weeklyAverage.map<number>((average: number): number => (average / maximum) * chartYHeight);
}

function activityThisWeek(activities: CommitActivity[] | undefined): number[] {
    if (!activities) return new Array<number>(7).fill(0);
    const currentTime: Date = new Date();
    console.log(currentTime);
    console.log(currentTime.getDate() - currentTime.getDay());
    const startDate: Date = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() - currentTime.getDay());
    return activities.reduce<number[]>(
        (actThisWeek: number[], activity: CommitActivity): number[] => {
            const actDate = new Date(activity.authoredAt);
            //console.log(`Commit Date: ${actDate.toString()} < startDate: ${startDate.toString()} ? ${actDate.getTime() < startDate.getTime()}`);
            if (Number.isNaN(actDate.getTime())) {
                return actThisWeek;
            }
            if (actDate.getTime() < startDate.getTime()) {
                //console.log("dates compared.")
                return actThisWeek;
            }
            actThisWeek[actDate.getDay()]++;
            return actThisWeek;
        }, Array<number>(7).fill(0)
    );
}

function WeeklyGraph(): React.JSX.Element {
    const [fontSize, setFontSize] = useState<number>(12);
    const [tooltipFontSize, setTooltipFontSize] = useState<number>(12);
    const [pointRadius, setPointRadius] = useState<number>(3);
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
            const handleResize = () => {
                if (window.screen.width > 2559) {
                    setFontSize(52);
                    setTooltipFontSize(48);
                }
                else if (window.screen.width > 1439) {
                    setFontSize(36);
                    setTooltipFontSize(32);
                }
                else if (window.screen.width > 1023) {
                    setFontSize(24);
                    setTooltipFontSize(20);
                }
                else if (window.screen.width > 767) {
                    setFontSize(12);
                    setTooltipFontSize(16);
                }
                else {
                    setFontSize(12);
                    setTooltipFontSize(12);
                }
            }
            handlePointRadiusResize();
            handleResize();
            window.addEventListener('resize', handlePointRadiusResize);
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handlePointRadiusResize);
                window.removeEventListener('resize', handleResize);
            }
        }, []);

    const { filteredCommits } = useProjectsContext();
    const weeklyAccumulative: number[] = useMemo(
        (): number[] => activityThisWeek(filteredCommits),
        [filteredCommits]
    );
    const weeklyAverage: number[] = averageActivityByDayOfWeek(filteredCommits, Math.max(...weeklyAccumulative));

    const data: ChartData<"bar" | "line", number[], string> = {
        labels: WEEK_LABELS,
        datasets: [
            {
                label: "Weekly Average (Commits)",
                data: weeklyAverage,
                type: "line",
                pointBackgroundColor: "#35a3ac",
                backgroundColor: "#34C759",
                hoverBackgroundColor: "#289c44",
                pointRadius: pointRadius,
                pointHoverRadius: pointRadius + Math.floor(pointRadius / 3),
                pointHitRadius: pointRadius + Math.floor(pointRadius / 3),
            },
            {
                label: "Daily Accumulative (Commits)",
                data: weeklyAccumulative,
                type: "bar",
                backgroundColor: "#9dada2",
                hoverBackgroundColor: "#849187",
                borderColor: "#FFFFFF",
                borderRadius: 4,
                borderSkipped: false,
            },
        ],
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
            },
        },
        plugins: {
            pluginWeeklyGraph: {
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
                    text: "Commits Over Last Week",
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
                        size: fontSize,
                    }
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
            }
        },
    };
    return (
        <div
            className={"weekly-graph-container"}>
            <figure
                className={"weekly-graph"}
            >
                <Chart<"bar" | "line", number[], string> type={"bar"} className={"rounded-4xl p-4"} data={data} options={options} plugins={[pluginWeeklyGraph]} />
            </figure>
        </div>
    );
}

export default WeeklyGraph;