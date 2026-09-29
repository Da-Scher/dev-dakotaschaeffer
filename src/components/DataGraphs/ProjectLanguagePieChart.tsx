import React from "react";
import {useProjectsContext} from "../../context/useProjectsContext";
import {generateColorOrder, makeSlices} from "./LanguagePieChartHelper";
import type {NormalizedLanguageStats} from "../../types/programlanguages";
import type {LanguageSlice} from "./LanguagePieChart";
//import "./LanguagePieChart.css";
import {shortenName} from "../../types/programlanguages";

interface ProjectLanguagePieChartProps {
    languageStats: NormalizedLanguageStats | undefined;
}

function ProjectLanguagePieChart(props: ProjectLanguagePieChartProps): React.JSX.Element {
    const {selectedLanguages} = useProjectsContext();
    const {languageStats} = props;
    if (!languageStats) {
        return <p>No Language Statistics...</p>;
    }
    const colorOrder: string[] = generateColorOrder(languageStats);

    const slices: LanguageSlice[] | undefined = makeSlices(languageStats, colorOrder, selectedLanguages);

    if (!slices) {
        return <p>No Language Statistics...</p>;
    }

    return (
        <figure
            className={"min-h-0 grow flex flex-col"}
        >
            <ul
                className={"pie-chart-mini"}
            >
                {
                    slices.map((slice: LanguageSlice, index: number): React.JSX.Element => (
                        <li
                            style={{
                                "--data-percentage": slice.percentage,
                                "--data-color": slice.color,
                                "--accum": slice.accumulatedPercentage,
                                "--slice-index": index,
                            } as React.CSSProperties}
                            key={slice.language}
                        />
                    ))
                }
            </ul>
            <table className={"w-full"}>
                <thead
                    className={"language-table-head top-0 sticky"}>
                <tr>
                    <th className={"pl-16"}>Language</th>
                    <td className={"text-right"}>%</td>
                </tr>
                </thead>
            </table>
            <div className="grow min-h-0 overflow-auto overscroll-contain scrollbar-gutter-stable">
                <table className={""}>
                    <tbody
                        className={"flex flex-col gap-1"}
                    >
                    {
                        slices.map((slice) => {
                            return (
                                <tr
                                    key={slice.language}
                                    className={"flex flex-row pb-0.5 bg-(--accent-color) sticky rounded-2xl"}
                                >
                                    <th
                                        scope={"row"}
                                        className={"inline-flex items-center justify-center pl-1"}
                                    >
                                        <span
                                            className={"language-color"}
                                            style={{backgroundColor: slice.color}}
                                            aria-hidden={true}
                                        />
                                        <p
                                            className={"ml-1"}
                                        >
                                            {slice.language.length > 5
                                                ? shortenName.get(slice.language)
                                                    ? shortenName.get(slice.language)
                                                    : "?????"
                                                : slice.language}
                                        </p>
                                    </th>
                                    <td
                                        className={"min-w-0 grow"}
                                    >
                                        <p
                                            className={"text-right mr-1"}
                                        >
                                            {slice.percentage.toFixed(2)}
                                        </p>

                                    </td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </table>
            </div>
        </figure>
    );
}

export default ProjectLanguagePieChart;