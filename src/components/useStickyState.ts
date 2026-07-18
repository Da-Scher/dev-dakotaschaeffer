import {type RefObject, useEffect, useRef, useState} from "react";

export function useStickyState(stickyTop: number = 0): {sentinelRef: RefObject<HTMLDivElement | null>, isSticky: boolean} {
    const sentinelRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const sentinel = sentinelRef.current;

        if (!sentinel) {
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
                if (!entry) {
                    return;
                }
                const crossedStickyBoundary = entry.boundingClientRect.top < stickyTop;

                console.table({
                    isIntersecting: entry.isIntersecting,
                    intersectionRatio: entry.intersectionRatio,
                    sentinelTop: entry.boundingClientRect.top,
                    rootTop: entry.rootBounds?.top,
                    stickyTop,
                });

                setIsSticky(!entry.isIntersecting && crossedStickyBoundary);
            },
            {
                root: null,
                threshold: 0,
                rootMargin: `-${stickyTop}px 0px 0px 0px`,
            },
        );

        observer.observe(sentinel);
        return () => {
            observer.disconnect();
        }
    }, [stickyTop]);

    return {
        sentinelRef,
        isSticky,
    }
}