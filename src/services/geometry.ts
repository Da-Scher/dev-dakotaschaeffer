import {useEffect, useState} from "react";

export interface CircleGeometry {
    centerX: number;
    centerY: number;
    radius: number;
}

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(() =>
        typeof window !== "undefined"
            ?   window.matchMedia(query).matches
            :   false,
    );

    useEffect(() => {
        const mediaQuery: MediaQueryList = window.matchMedia(query);

        const updateMatch: () => void = (): void => {
            setMatches(mediaQuery.matches);
        };

        updateMatch();

        mediaQuery.addEventListener('change', updateMatch);

        return (): void => {
            mediaQuery.removeEventListener('change', updateMatch);
        }
    }, [query]);

    return matches;
}