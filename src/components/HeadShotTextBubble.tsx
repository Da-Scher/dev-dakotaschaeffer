import React, {useLayoutEffect, useRef} from "react";
import type {RefObject} from "react";
import "./../index.css";
import "./headerStyle.css";

export interface HeadShotBubbleProps {
    text: string;
    link?: string;
    lineSize: number;
    lines: number;
    headshotRef: RefObject<HTMLImageElement | null>;
}

function lineCutOff(line: string, start: number, lineLength: number): string {
    //console.log(`lineCutOff(line = "${line}", start = ${start}, lineLength = ${lineLength}).`);
    let returnLine: string = line.slice(start);
    let ellipsesIndex: number = 0;
    /* consectetur adipiscing blah -> consectetur adipiscing ... -> consectetur ... */
    while (returnLine.length > lineLength) {
        //console.log(`lineCutOff(line = "${line}", start = ${start}, lineLength = ${lineLength}) loop. (returnLine.length = ${returnLine.length}) > (lineLength = ${lineLength})`);
        //console.log(`returnLine = ${returnLine}`);
        if (returnLine.length === lineLength) {
            //console.log(`lineCutOff(line, start = ${start}, lineLength = ${lineLength}) exact case.`);
            break;
        }
        if (ellipsesIndex === 0) {
            ellipsesIndex = returnLine.lastIndexOf(" ");
            returnLine = returnLine.substring(0, returnLine.lastIndexOf(" "));
        }
        else {
            ellipsesIndex = returnLine.lastIndexOf(" ", ellipsesIndex - 1);
            returnLine = returnLine.substring(0, returnLine.lastIndexOf(" ", ellipsesIndex));
        }
        returnLine += " ...";
        //console.log(`returnLine = ${returnLine}`);
    }
    return returnLine;
}

function HeadShotTextBubble(props: HeadShotBubbleProps): React.JSX.Element {
    const {text, link, lineSize, lines, headshotRef} = props;

    const elementRef: RefObject<HTMLElement | null> = useRef(null);
    const animationFrameRef: RefObject<number | null> = useRef(null);

    const getRect: () => [x: number, y: number] | null = (): [x: number, y: number] | null => {
        if (elementRef.current) {
            const rect: DOMRect = elementRef.current.getBoundingClientRect();
            return [rect.x, rect.top + rect.height / 2];
        }
        return null;
    }

    //const requestXOffset = React.useCallback((): void => {
    //    console.log("requestXOffset() Callback Start.");
    //    if (animationFrameRef.current !== null) {
    //        console.log("requestXOffset() animationFrameRef.current is not null. Return.");
    //        return;
    //    }
    //    console.log("requestXOffset() requestAnimationFrame(determineXOffset())");
    //    animationFrameRef.current = requestAnimationFrame(determineXOffset);
    //    console.log(`requestXOffset() requestAnimationFrame(determineXOffset()) = ${animationFrameRef.current}`);
    //}, [determineXOffset]);

    useLayoutEffect(() => {
        console.log('')
        let frameId: number;

        const determineXOffset: () => void = ():void => {
            const element = elementRef.current;
            if (!element) return;
            if (window.screen.width < 767) {
                element.style.setProperty("--transform-x", "0px");
                frameId = window.requestAnimationFrame(determineXOffset);
                return;
            }
            animationFrameRef.current = null;
            const rect: [x: number, y: number] | null = getRect();
            const headshot: HTMLImageElement | null = headshotRef.current;
            if (!headshot) {
                frameId = window.requestAnimationFrame(determineXOffset);
                return;
            }
            if (!elementRef.current) {
                frameId = window.requestAnimationFrame(determineXOffset);
                return;
            }
            const headshotRect: DOMRect = headshot.getBoundingClientRect();
            const circleCenterY: number = headshotRect.top + headshotRect.height / 2;
            const headshotRadius: number = Math.min(headshotRect.width, headshotRect.height) / 2;
            const fakeCircleRadius: number = headshotRadius + 4;
            if (rect === null) {
                return;
            } else {
                const y: number = rect[1];
                const deltaY: number = y - circleCenterY;
                const clampY: number = Math.max(-fakeCircleRadius, Math.min(fakeCircleRadius, deltaY));
                const deltaX: number = Math.sqrt(Math.max(0, fakeCircleRadius ** 2 - clampY ** 2));
                elementRef.current.style.setProperty('--transform-x', `${4 + deltaX}px`)
            }
            frameId = requestAnimationFrame(determineXOffset);
        }

        frameId = requestAnimationFrame(determineXOffset);
        window.addEventListener("resize", determineXOffset);

        return () => {
            cancelAnimationFrame(frameId)
            window.removeEventListener("resize", determineXOffset);
        };

    }, [headshotRef])

    const generatedLines: Array<string> = ((text: string, lineSize: number, lines: number): Array<string> => {
        const ellipseRequired: boolean = text.length > lineSize * lines;
        const selection: string = text.length > lineSize * lines
            ? text[lineSize * lines] === " "
                ? text.slice(0, lineSize * lines)
                : text.slice(0, text.lastIndexOf(" ", lineSize * lines))
            : text
        let pos: number = 0;
        const generatedLines: Array<string> = [];
        for (let i: number = 0; i < lines; i++) {
            if (i !== lines - 1) {
                const idx: number = selection.lastIndexOf(" ", lineSize * (i + 1));
                //console.log(selection.slice(pos))
                if (selection.slice(pos).length < lineSize) {
                    console.log(`${selection.slice(pos)} is the end.`)
                    generatedLines.push(selection.slice(pos));
                    while(i < lines) {
                        generatedLines.push("\n");
                        i++;
                    }
                    break;
                }
                generatedLines.push(selection.slice(pos, idx));
                pos = idx;
            }
            else {
                //if (pos === selection.length) console.log('easy?');
                //console.log( "i = lines - 1")
                if (ellipseRequired) {
                    const lastLine: string = lineCutOff(selection, pos, lineSize)
                    if (!lastLine.endsWith(" ...")) {
                        generatedLines.push(lastLine + " ...");
                    }
                    else generatedLines.push(lineCutOff(selection, pos, lineSize))
                }
                else generatedLines.push(lineCutOff(selection, pos, lineSize))
            }
        }
        return generatedLines;

    })(text, lineSize, lines);

    const linkIfDefined: () => React.JSX.Element = (): React.JSX.Element => {
        return link
            ? <span ref={elementRef} className={`flex items-center mb-2`}>
                <div
                    className={`link-bubble-tail h-0 w-0 border-r-32 border-t-32 border-t-transparent border-l-transparent border-b-transparent`}
                />
                <div
                    className={`link-bubble-body w-full h-21 lg:h-39.25 md:w-90 rounded-2xl mr-4 border-b-2 border-b-transparent border-r-2 border-r-transparent`}>
                    {generatedLines.map((line: string): React.JSX.Element => (
                        <a href={link} className={"pl-4 link-bubble "}>{line}<br/></a>))}
                </div>
            </span>
            :
                <span ref={elementRef} className={`flex items-center mb-2`}>
                    <div
                        className={"text-bubble-tail h-0 w-0 border-r-32 border-t-32 border-t-transparent border-l-transparent border-b-transparent"}
                    />
                    <div
                        className={"text-bubble-body w-full h-21 lg:h-39.25 md:w-90 rounded-2xl mr-4 border-b-2 border-b-transparent border-r-2 border-r-transparent"}>
                        { generatedLines.map((line: string): React.JSX.Element => (<span className={"pl-4 text-bubble"}>{line}<br/></span>)) }
                    </div>
                </span>
    }

    return (
        <div className={'text-bubble-object'}>
            { linkIfDefined() }
        </div>
    );
}

export default HeadShotTextBubble;