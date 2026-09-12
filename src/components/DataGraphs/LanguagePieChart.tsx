import React from "react";
import type { LanguageStat, NormalizedLanguageStats } from "../../types/programlanguages";
import "./LanguagePieChart.css";
import { useProjectsContext } from "../../context/useProjectsContext";
import {
    makeSlices,
    generateColorOrder,
    calculateLanguageStats
} from "./LanguagePieChartHelper";

export interface LanguageSlice {
    language: string;
    stat: LanguageStat;
    percentage: number;
    accumulatedPercentage: number;
    color: string;
}

function LanguagePieChart(): React.JSX.Element {
    const [highlightedLanguage, setHighlightedLanguage] = React.useState<string | null>(null);
    //const [primaryLanguage, setPrimaryLanguage] = React.useState<string | null>(null);
    const [isAnimating, setIsAnimating] = React.useState<boolean>(true);

    const {
        filteredCommits,
        selectedLanguages,
        toggleSlice,
        eventPieChartToggle,
    } = useProjectsContext();

    function clickEvent(slice: LanguageSlice) {
        toggleSlice(slice);
    }

    const languageStats: NormalizedLanguageStats = React.useMemo(
        (): NormalizedLanguageStats => calculateLanguageStats(filteredCommits),
        [filteredCommits]
    )

    const colorOrder: string[] = generateColorOrder(languageStats as NormalizedLanguageStats);

    console.log(`color order: ${colorOrder.toString()}`);
    const slices: LanguageSlice[] = makeSlices(languageStats, colorOrder, selectedLanguages);

    React.useEffect(() => {
        console.log("please god work")
        for (const slice of slices) {
            if (slice.language === eventPieChartToggle) {
                toggleSlice(slice);
            }
        }
    }, [eventPieChartToggle]);


    return (
        <>
            { /* 1. List data */ }
            <figure
                className={"language-chart activity-chart"}
            >
                <figcaption>Language use statistics</figcaption>
                <ul
                    className={`pie-chart ${isAnimating ? "is-animating" : ""}`}
                    onAnimationStart={(event) => {
                        if (event.animationName === "piechart-grow") {
                            setIsAnimating(true);
                        }
                    }}
                    onAnimationEnd={(event) => {
                        const lastSlice = event.currentTarget.lastChild;
                        if (event.animationName === "piechart-grow" && event.target === lastSlice) {
                            setIsAnimating(false);
                        }
                    }}
                    aria-hidden={true}
                >
                    {slices.map((slice, index) =>
                        (
                                    <li
                                        className={
                                            highlightedLanguage === slice.language
                                                ? "is-highlighted"
                                                : undefined
                                        }
                                        style={{
                                            "--data-percentage": slice.percentage,
                                            "--data-color": slice.color,
                                            "--accum": slice.accumulatedPercentage,
                                            "--slice-index": index,
                                        } as React.CSSProperties}
                                        key={`${selectedLanguages ?? "all"}-${slice.language}`}
                                    />
                    ))}
                </ul>
                <table>
                    <thead>
                        <tr>
                            <th>Language</th>
                            <th>Changes</th>
                            <th>Usage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {slices.map((slice) => {
                            //const typedLanguage = slice.language as ProgrammingLanguage;

                            return (
                            <tr
                                key={slice.language}
                                tabIndex={0}
                                aria-pressed={selectedLanguages.has(slice)}
                                onMouseEnter={() => setHighlightedLanguage(slice.language)}
                                onMouseLeave={() => setHighlightedLanguage(null)}
                                onFocus={() => setHighlightedLanguage(slice.language)}
                                onBlur={() => setHighlightedLanguage(null)}
                                onClick={() => clickEvent(slice)}
                            >
                                <th scope={"row"}>
                                    <span
                                        className={"language-color"}
                                        style={{
                                            backgroundColor: slice.color,
                                        }}
                                        aria-hidden={true}
                                    />
                                    {slice.language}
                                </th>
                                <td>
                                    {slice.stat.changes.toLocaleString()}
                                </td>
                                <td>
                                    {slice.percentage.toFixed(2)}%
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </figure>
        </>
    );
}

export default LanguagePieChart;