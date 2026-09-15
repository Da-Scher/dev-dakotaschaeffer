import React, {useCallback, useLayoutEffect, useMemo, useRef, useState} from "react";
import type {Ref} from "react";
import HeadShotTextBubble from "./HeadShotTextBubble";
import type {CircleGeometry} from "../services/geometry";

export interface TextBubbleSectionProps {
    headshotGeometry?: CircleGeometry | null;
}

export interface TextBubbleObject {
    text: string;
    link?: string;
}

const bubblesText: TextBubbleObject[] = [
    {text: "text 1"},
    {text: "Lorem ipsum dolor sit amet, consectetur massa nunc.", link: "#"},
    {text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut quis dui at diam laoreet ultrices. Sed tristique sollicitudin quam sit amet tempus. Etiam urna lorem."},
    {text: "Lorem ipsum dolor sit amet.", link: "#"},
    {text: "text 2"},
    {text: "Lorem ipsum dolor sit amet, consectetur Ut quis dui at."},
    {text: "Lorem ipsum dolor sit amet, consectetur sed tristique sollicitudin quam sit amet tempus.", link: "#"},
    {text: "text 3"},
    {text: "Last text (text 4)"},
] as const;

function TextBubbleSection({headshotGeometry}: TextBubbleSectionProps): React.JSX.Element {
    const items: TextBubbleObject[] = [...bubblesText, ...bubblesText];

    const scrollRef: Ref<HTMLDivElement> = useRef(null);
    const [desktop, setDesktop] = useState<boolean>(window.screen.width >= 1024);
    const [linesPerBubble, setLinesPerBubble] = useState(window.screen.width >= 1024 ? 5 : 3);
    const [charactersPerLine, setCharactersPerLine] = useState(window.screen.width >= 1024 ? 32 : window.screen.width >= 768 ? 24 : 15);

    const updateDesktop: () => void = useCallback((): void =>{
        setDesktop(window.screen.width >= 1024);
        setLinesPerBubble(window.screen.width >= 1024 ? 5 : 3);
        setCharactersPerLine(window.screen.width >= 1024 ? 32 : window.screen.width >= 768 ? 24 : 15);
    }, [setDesktop]);

    useLayoutEffect(() => {

        window.addEventListener("resize", updateDesktop);

        return () => {
            window.removeEventListener("resize", updateDesktop);

        }
    }, [updateDesktop]);
    const keyFrames: string = useMemo((): string => {
        const percentagePerItem = 100 / bubblesText.length;
        let keyFrameRule: string = "@keyframes TextCarousel {\n 0% { transform: translateY(0); }\n";

        for (let i: number = 0; i < bubblesText.length; i++) {

            const startPercentage: number = i * percentagePerItem;
            const pausePercentage: number = Math.floor(startPercentage + (percentagePerItem * 0.9));
            const popPercentage: number = Math.floor(pausePercentage + (percentagePerItem * 0.1));

            keyFrameRule += `${pausePercentage}% { transform: translateY(calc(-1 * ${desktop ? 165 * i : 92 * i}px)); }\n`;
            keyFrameRule += `${popPercentage}% { transform: translateY(${popPercentage !== 100 ? `calc(-1 * ${desktop ? 165 * (i + 1) : 92 * (i + 1)}px)` : `-50%`}); }\n`;

        }
        if (!keyFrameRule.includes("100%")) {
            keyFrameRule += `100% { transform: translateY(-50%); }\n`
        }
        return keyFrameRule + "\n}";
    }, [desktop]);
    return (
        <div className={"w-full"}>
            <style>{keyFrames}</style>
            <div className={"text-bubble-section"}>
                <div className={"text-bubble-scroll"}
                     ref={scrollRef}
                     style={{animation: `TextCarousel ${bubblesText.length * 3}s infinite ease-in-out`} as React.CSSProperties}>
                    {
                        items.map((item: TextBubbleObject, index: number): React.JSX.Element => (
                            <HeadShotTextBubble
                                key={index}
                                text={item.text} link={item.link} lineSize={charactersPerLine}
                                lines={linesPerBubble}
                                headshotCircle={headshotGeometry ? headshotGeometry : null}
                            />
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

export default TextBubbleSection;