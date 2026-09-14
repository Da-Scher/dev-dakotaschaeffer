import React, {useLayoutEffect, useRef, useState} from "react";
import "./headerStyle.css";
import TextBubbleSection from "./TextBubbleSection";

type HeadShotProps = {
    className?: string;
};

export type CircleGeometry = {
    centerX: number;
    centerY: number;
    radius: number;
};

function HeadShot({className = ""}: HeadShotProps): React.JSX.Element {
    const circleRef: React.RefObject<HTMLImageElement | null> = useRef<HTMLImageElement | null>(null);
    const [geometry, setGeometry] = useState<CircleGeometry | null>(null);

    useLayoutEffect(() => {

        console.log('HeadShot useLayoutEffect');
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
    }, []);

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
            />
            <TextBubbleSection headshotGeometry={geometry}/>
        </div>
    )
}

export default HeadShot;