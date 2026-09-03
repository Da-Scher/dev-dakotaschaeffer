import React from "react";
import type {
    LanguageStat, LanguageStats,
    NormalizedLanguageStats,
    ProgrammingLanguage
} from "../../types/programlanguages";

import "./LanguagePieChart.css";
import {useProjectsContext} from "../../context/useProjectsContext";
import type {CommitActivity} from "../../types/commit";

interface LanguageSlice {
    language: string;
    stat: LanguageStat;
    percentage: number;
    accumulatedPercentage: number;
    color: string;
}

const PIE_COLORS = [
    "#0000FF",
    "#008000",
    "#FFA500",
    "#800080",
    "#FF0000",
]

function calculateLanguageStats(commits: CommitActivity[]): NormalizedLanguageStats {
    const langStatsMap: NormalizedLanguageStats =
        commits.map((commit: CommitActivity): NormalizedLanguageStats | undefined => {
            return commit.languageStats;
        }).filter((langStats: NormalizedLanguageStats | undefined): langStats is NormalizedLanguageStats => {
            return (langStats !== undefined);
        }).reduce((total: NormalizedLanguageStats, current: NormalizedLanguageStats): NormalizedLanguageStats => {
            for (const [language, stats] of Object.entries(current.stats)) {
                const combinedStats: LanguageStat = total.stats[language as ProgrammingLanguage] ??= {
                    additions: 0,
                    deletions: 0,
                    changes: 0,
                }

                combinedStats.additions += stats.additions;
                combinedStats.deletions += stats.deletions;
                combinedStats.changes += stats.changes;
            }

            total.totals.additions += current.totals.additions;
            total.totals.deletions += current.totals.deletions;
            total.totals.changes += current.totals.changes;

            return total;
        },
        {
            stats: {},
            totals: {
                additions: 0,
                deletions: 0,
                changes: 0,
            }
        })
    const sortLangStats: [string, LanguageStat][] =
        Object.entries(langStatsMap.stats).sort((a: [string, LanguageStat], b: [string, LanguageStat]): number =>
            b[1].changes - a[1].changes
        );
    const returnLangStats: LanguageStats = Object.fromEntries(sortLangStats) as unknown as LanguageStats;
    return {
        stats: returnLangStats,
        totals: langStatsMap.totals,
    }
}

function LanguagePieChart(): React.JSX.Element {
    const [highlightedLanguage, setHighlightedLanguage] = React.useState<Set<string>>(() => new Set());
    //const [primaryLanguage, setPrimaryLanguage] = React.useState<string | null>(null);
    const [isAnimating, setIsAnimating] = React.useState<boolean>(true);

    const {
        filteredCommits,
        selectedLanguages,
        toggleLanguage,
    } = useProjectsContext();

    const languageStats: NormalizedLanguageStats = React.useMemo(
        (): NormalizedLanguageStats => calculateLanguageStats(filteredCommits),
        [filteredCommits]
    )

    let accumulatedPercentage: number = 0;

    const colorOrder: string[] = ((): string[] => {
        let slices: number = Object.keys(languageStats.stats).length;
        if (slices <= 5) {
            return Array.from({length: slices}, (_: unknown, index: number): string => PIE_COLORS[index]);
        }
        else {
            const order: string[] = Array.from({length: 5}, (_: unknown, index: number): string => PIE_COLORS[index]);
            slices -= 5;
            while (slices > 0) {
                if (slices >= 5) {
                    order.push(...Array.from({length: 5}, (_: unknown, index: number): string => PIE_COLORS[index]));
                    slices -= 5;
                }
                else {
                    order.push(...Array.from({length: slices}, (_: unknown, index: number): string => PIE_COLORS[index+1]));
                    slices -= slices
                }
            }
            return order;
        }
    })();

    console.log(colorOrder);

    const slices: LanguageSlice[] = Object.entries(languageStats.stats).map(
        ([language, stat], index) => {
            console.log(accumulatedPercentage);
            const percentage: number =
                languageStats.totals.changes === 0
                ? 0
                : (stat.changes / languageStats.totals.changes) * 100;
            const slice: LanguageSlice = {
                language,
                stat,
                percentage,
                accumulatedPercentage,
                color: colorOrder[index]
            };
            accumulatedPercentage += percentage;
            return slice;
        }
    );


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
                            const typedLanguage = slice.language as ProgrammingLanguage;

                            return (
                            <tr
                                key={slice.language}
                                tabIndex={0}
                                aria-pressed={selectedLanguages.has(typedLanguage)}
                                onMouseEnter={() => setHighlightedLanguage(slice.language)}
                                onMouseLeave={() => setHighlightedLanguage(null)}
                                onFocus={() => setHighlightedLanguage(slice.language)}
                                onBlur={() => setHighlightedLanguage(null)}
                                onClick={() => toggleLanguage(typedLanguage)}
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