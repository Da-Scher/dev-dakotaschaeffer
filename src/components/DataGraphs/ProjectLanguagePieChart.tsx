import React from "react";
import {useProjectsContext} from "../../context/useProjectsContext";
import {generateColorOrder, makeSlices} from "./LanguagePieChartHelper";
import type {NormalizedLanguageStats} from "../../types/programlanguages";
import type {LanguageSlice} from "./LanguagePieChart";
import "./LanguagePieChart.css";

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

    const slices: LanguageSlice[] = makeSlices(languageStats, colorOrder, selectedLanguages);

    return (
        <figure

        >
            <figcaption>
                Language Use Statistics
            </figcaption>
            <ul
                className={`pie-chart`}
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
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Changes</th>
                    <th>Usage</th>
                </tr>
                </thead>
                <tbody>
                {
                    slices.map((slice) => {
                        return (
                            <tr key={slice.language}>
                                <th scope={"row"}>
                                    <span
                                        style={{backgroundColor: slice.color}}
                                        aria-hidden={true}
                                    />
                                    {slice.language}
                                </th>
                                <td>
                                    {slice.stat.changes.toLocaleString()}
                                </td>
                                <td>
                                    {slice.percentage.toFixed(2)}
                                </td>
                            </tr>
                        );
                    })
                }
                </tbody>
            </table>

        </figure>
    );
}

export default ProjectLanguagePieChart;