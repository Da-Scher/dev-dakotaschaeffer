import React from "react";
import type { LanguageStat, NormalizedLanguageStats } from "../../types/programlanguages";
import "./LanguagePieChart.css";
import { useProjectsContext } from "../../context/useProjectsContext";
import {
    makeSlices,
    generateColorOrder,
    calculateLanguageStats
} from "./LanguagePieChartHelper";
import LanguageTable from "./LanguageTable";

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

    //function clickEvent(slice: LanguageSlice) {
    //    toggleSlice(slice);
    //}

    const languageStats: NormalizedLanguageStats | undefined = React.useMemo(
        (): NormalizedLanguageStats | undefined => calculateLanguageStats(filteredCommits),
        [filteredCommits]
    )

    const colorOrder: string[] = generateColorOrder(languageStats as NormalizedLanguageStats);

    const slices: LanguageSlice[] | undefined = makeSlices(languageStats, colorOrder, selectedLanguages);
    console.log(slices);

    React.useEffect(() => {
        if (!slices) return;
        for (const slice of slices) {
            console.log(`eventPieChartToggle: ${eventPieChartToggle}`);
            if (slice.language === eventPieChartToggle) {
                //console.log(`LanguagePieChart: Would toggleSlice here.`)
                toggleSlice(slice);
            }
        }
    }, [toggleSlice, slices, eventPieChartToggle]);


    return (
        <>
            { /* 1. List data */ }
            <figure
                className={"language-chart activity-chart"}
            >
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
                    {slices && slices.map((slice, index) =>
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
                <LanguageTable slices={slices} setHighlightedLanguage={setHighlightedLanguage} />
            </figure>
        </>
    );
}

export default LanguagePieChart;