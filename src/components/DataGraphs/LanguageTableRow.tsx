import React, {useLayoutEffect} from "react";
import type {LanguageSlice} from "./LanguagePieChart";
import "./LanguagePieChart.css"
import {useProjectsContext} from "../../context/useProjectsContext";
import {shortenName} from "../../types/programlanguages";

interface LanguageTableRowProps {
    language: LanguageSlice;
    setHighlightedLanguage: (language: string | null) => void;
}

function LanguageTableRow(props: LanguageTableRowProps): React.JSX.Element {
    const [onMobile, setOnMobile] = React.useState<boolean>(window.screen.width < 768);

    const {language, setHighlightedLanguage} = props;
    const {selectedLanguages, toggleSlice} = useProjectsContext();

    const screenCheck: () => void = (): void => {
        setOnMobile(window.screen.width < 768);
    };

    useLayoutEffect((): () => void => {
        window.addEventListener("resize", screenCheck);
        return (): void => {
            window.removeEventListener("resize", screenCheck);
        }
    }, []);

    const renderLanguage: (lang: string) => string = (lang: string): string => {
        if (lang.length <= 5) {
            return lang;
        }
        const shortenedLang: string | undefined = shortenName.get(lang);
        return shortenedLang ? shortenedLang : "?????";
    }

    const containsLanguage: (language: string) => boolean = (language: string): boolean => {
        if (selectedLanguages) {
            for (const selected of selectedLanguages) {
                if (selected.language === language) return true;
            }
        }
        return false;
    }

    return (
        <tr
            className={`${containsLanguage(language.language) ? "pressed" : ""} pill flex flex-row pb-0.5 bg-(--main-color) sticky`}
            tabIndex={0}
            aria-pressed={selectedLanguages.has(language)}
            onMouseEnter={(): void => setHighlightedLanguage(language.language)}
            onMouseLeave={(): void => setHighlightedLanguage(null)}
            onClick={(): void => toggleSlice(language)}
        >
            <th
                //className={"bg-(--accent-color) rounded-l-2xl align-middle"}
                //scope={"row"}
            >
                <span className={"language-color"} style={{backgroundColor: language.color}} aria-hidden={true}/>
                {onMobile ? renderLanguage(language.language) : language.language}
            </th>
            {!onMobile && <td className={"bg-(--accent-color)"}>{language.stat.changes}</td>}
            <td
                //className={"bg-(--accent-color) rounded-r-2xl "}
            >{Math.ceil(language.percentage)}</td>
        </tr>
    );
}

export default LanguageTableRow;