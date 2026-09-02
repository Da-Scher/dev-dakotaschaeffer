import { useContext } from "react";
import type {LanguageStatisticsContextValue} from "./LanguageStatisticsContext";
import { LanguageStatisticsContext } from "./LanguageStatisticsContext";

export function useLanguageStatistics(): LanguageStatisticsContextValue {
    const context = useContext(LanguageStatisticsContext);

    if (!context) {
        throw new Error(
            "useLanguageStatistics must be used inside LanguageStatisticsProvider"
        );
    }

    return context;
}