import React, {useRef} from "react";
import type {RefObject} from "react";
import "./headerStyle.css";
import TextBubbleSection from "./TextBubbleSection";

type HeadShotProps = {
    className?: string;
};

function HeadShot({className = ""}: HeadShotProps): React.JSX.Element {
    const headshotRef: RefObject<HTMLImageElement | null> = useRef(null);

    return (
        <div className={"flex"}>
            <img
                src={"./../public/EXAMPLE_pp.png"}
                alt={"Firstname Lastname"}
                className={className}
                ref={headshotRef}
            />
            <TextBubbleSection
                headshotRef={headshotRef}
            />
        </div>
    )
}

export default HeadShot;