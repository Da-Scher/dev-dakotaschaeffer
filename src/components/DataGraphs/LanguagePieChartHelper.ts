import type {
    LanguageStat,
    LanguageStats,
    NormalizedLanguageStats,
    ProgrammingLanguage
} from "../../types/programlanguages";
import type {LanguageSlice} from "./LanguagePieChart";
import type {CommitActivity} from "../../types/commit";

const PIE_COLORS: string[] = [
    "#0000FF",
    "#008000",
    "#FFA500",
    "#800080",
    "#FF0000",
];

export function generateColorOrder(languageStats: NormalizedLanguageStats): string[] {
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
}

export function makeSlices(languageStats: NormalizedLanguageStats, colorOrder: string[], selectedLanguages: Set<LanguageSlice>) {
    let accumulatedPercentage: number = 0;
    let currentIndex: number = 0;
    return Object.entries(languageStats.stats).map(
        ([language, stat]) => {
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
                color: ((): string => {
                    console.log(`selectedLanguages length: ${selectedLanguages.size}`);
                    for (const slice of selectedLanguages) {
                        console.log(`slice.color ${slice.color} and colorOrder[currentIndex ${currentIndex} % colorOrder.length ${colorOrder.length}] ${colorOrder[currentIndex % colorOrder.length]}`);
                        if (slice.color === colorOrder[currentIndex % colorOrder.length]) {
                            while (slice.color === colorOrder[currentIndex % colorOrder.length % colorOrder.length])
                                currentIndex++;
                        }
                        if (slice.language === language) {
                            return slice.color;
                        }
                    }
                    console.log(`currentIndex: ${currentIndex}`);
                    console.log(colorOrder[currentIndex]);
                    return colorOrder[currentIndex++ % colorOrder.length];
                })()
            }
            accumulatedPercentage += percentage;
            return slice;
        })
}

export function calculateLanguageStats(commits: CommitActivity[]): NormalizedLanguageStats {
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