import React, {useLayoutEffect, useRef, useState} from "react";
import "./headerStyle.css";
import TextBubbleSection from "./TextBubbleSection";
import type {CircleGeometry} from "../services/geometry";
import {useMediaQuery} from "../services/geometry";

type HeadShotProps = {
    className?: string;
};

function HeadShot({className = ""}: HeadShotProps): React.JSX.Element {
    const circleRef: React.RefObject<HTMLImageElement | null> = useRef<HTMLImageElement | null>(null);
    const [geometry, setGeometry] = useState<CircleGeometry | null>(null);

    const useCircularLayout: boolean = useMediaQuery("(min-width: 768px)");

    useLayoutEffect(() => {
        const circle: HTMLImageElement | null = circleRef.current;

        if (!circle) return;

        const measure = (): void => {
            const rect: DOMRect = circle.getBoundingClientRect();

            setGeometry({
                centerX: rect.left + window.scrollX + rect.width / 2,
                centerY: rect.top + window.scrollY + rect.height / 2,
                radius: Math.min(rect.width, rect.height) / 2,
            });
        };

        measure();

        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(circle);

        window.addEventListener('resize', measure);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', measure);
        }
    }, [setGeometry]);

    //const updateProps: () => void = (): void => {
    //    setProps(getProps());
    //}
    //useEffect(() => {updateProps()}, [])
    return (
        <div className={"flex"}>
            <img
                src={"./../public/EXAMPLE_pp.png"}
                alt={"Firstname Lastname"}
                className={className}
                ref={circleRef}
                onLoad={() => {
                    const rect: DOMRect | undefined = circleRef.current?.getBoundingClientRect();
                    if (rect) {
                        setGeometry({
                            centerX: rect.left + rect.width / 2,
                            centerY: rect.top + rect.height / 2,
                            radius: Math.min(rect.width, rect.height) / 2,
                        });
                    }
                }}
            />
            <TextBubbleSection
                headshotGeometry={useCircularLayout ? geometry : null}
            />
        </div>
    )
}

export default HeadShot;