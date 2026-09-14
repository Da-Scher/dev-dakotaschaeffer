import React, {useMemo} from "react";
import HeadShotTextBubble from "./HeadShotTextBubble";
import type {CircleGeometry} from "./HeadShot";

export interface TextBubbleSectionProps {
    headshotGeometry?: CircleGeometry | null;
}

export interface TextBubbleObject {
    text: string;
    link?: string;
}

const SIZE_OF_LINE = 16;
const NUMBER_OF_LINES = 3;

const bubblesText: TextBubbleObject[] = [
    {text: "Lorem ipsum dolor sit amet, consectetur massa nunc.", link: "#"},
    {text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut quis dui at diam laoreet ultrices. Sed tristique sollicitudin quam sit amet tempus. Etiam urna lorem."},
    {text: "Lorem ipsum dolor sit amet.", link: "#"},
    {text: "Lorem ipsum dolor sit amet, consectetur Ut quis dui at."},
    {text: "Lorem ipsum dolor sit amet, consectetur sed tristique sollicitudin quam sit amet tempus.", link: "#"},
] as const;

function TextBubbleSection({headshotGeometry}: TextBubbleSectionProps): React.JSX.Element {
    const items: TextBubbleObject[] = [...bubblesText, ...bubblesText];
    const keyFrames: string = useMemo((): string => {
        const percentagePerItem = 100 / bubblesText.length;
        let keyFrameRule: string = "@keyframes TextCarousel {\n 0% { transform: translateY(0); }\n";

        for (let i: number = 0; i < bubblesText.length; i++) {
            const startPercentage: number = i * percentagePerItem;
            const pausePercentage: number = startPercentage + 18;
            const popPercentage: number = pausePercentage + 2;

            keyFrameRule += `${pausePercentage}% { transform: translateY(calc(-1 * ${82 * i}px)); }\n`;
            keyFrameRule += `${popPercentage}% { transform: translateY(${popPercentage !== 100 ? `calc(-1 * ${82 * (i + 1)}px)` : `-50%`}); }\n`;

        }
        return keyFrameRule + "\n}";
    }, []);
    return (
        <>
            <style>{keyFrames}</style>
            <div className={"text-bubble-section"}>
                <div className={"text-bubble-scroll"}
                     style={{animation: `TextCarousel ${bubblesText.length * 3}s infinite ease-in-out`} as React.CSSProperties}>
                    {
                        items.map((item: TextBubbleObject, index: number): React.JSX.Element => (
                            <HeadShotTextBubble
                                key={index}
                                text={item.text} link={item.link} lineSize={SIZE_OF_LINE}
                                lines={NUMBER_OF_LINES}
                                headshotCircle={headshotGeometry ? headshotGeometry : null}
                            />
                        ))
                    }
                </div>
            </div>
        </>
    );
}

export default TextBubbleSection;