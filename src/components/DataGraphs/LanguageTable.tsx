import React, {useLayoutEffect} from "react";
import type {LanguageSlice} from "./LanguagePieChart";
import LanguageTableRow from "./LanguageTableRow";

interface LanguageTableProps {
    slices: LanguageSlice[] | undefined;
    setHighlightedLanguage: (language: string | null) => void;
}

function LanguageTable(props: LanguageTableProps): React.JSX.Element {
    const [onMobile, setOnMobile] = React.useState<boolean>(window.screen.width < 768);
    const { slices, setHighlightedLanguage } = props;

    const screenCheck: () => void = (): void => {
        setOnMobile(window.screen.width < 768);
    }

    useLayoutEffect((): () => void => {
        window.addEventListener("resize", screenCheck);
        return (): void => {
            window.removeEventListener("resize", screenCheck);
        }
    }, []);

    if (!slices) {
        return <p>Retrieving Language Usage Data...</p>;
    }



    return (
        <div>
            <table>
                <thead
                    className={"language-table-head top-0 bg-(--main-color) sticky"}
                >
                    <tr className={"text-black"}>
                        {onMobile ? <th>Lang</th> : <th>Language</th>}
                        {!onMobile && <td>Changes</td>}
                        {onMobile ? <td>%</td> : <td className={"text-right"}>Usage %</td>}
                    </tr>
                </thead>
            </table>
            <div className={"table-scroll"}>
            <table>
                <tbody
                >
                {
                    slices.map((l: LanguageSlice) => (
                        <LanguageTableRow
                            key={l.language}
                            language={l}
                            setHighlightedLanguage={setHighlightedLanguage}
                        />

                    ))
                }
                </tbody>
            </table>
            </div>
        </div>
    );
}

export default LanguageTable;