import React, {RefObject, useRef} from "react";
import "./../index.css";
import "./headerStyle.css";
import type {CircleGeometry} from "./HeadShot";

export interface HeadShotBubbleProps {
    text: string;
    link?: string;
    lineSize: number;
    lines: number;
    headshotCircle: CircleGeometry | null;
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
    const {text, link, lineSize, lines, headshotCircle} = props;

    const element: RefObject<HTMLElement | null> = useRef(null);
    const [xOffset, setXOffset] = React.useState<number>(0);

    const getRect: () => [x: number, y: number] | null = (): [x: number, y: number] | null => {
        if (element.current) {
            const rect: DOMRect = element.current.getBoundingClientRect();
            return [rect.x, rect.top + rect.height / 2];
        }
        return null;
    }

    const determineXOffset: () => void = (): void => {
        const rect: [x: number, y: number] | null = getRect();
        if (headshotCircle === undefined || headshotCircle === null) return;
        const {centerX, centerY, radius} = headshotCircle;
        const fakeCircleRadius: number = radius + 4;
        if (rect === null) {
            console.log("determineXOffset :: rect is null.");
            return;
        }
        else {
            const [x, y] = rect;
            const deltaY: number = y - centerY;
            const clampY: number = Math.max(-fakeCircleRadius, Math.min(fakeCircleRadius, deltaY));
            const deltaX: number = Math.sqrt(Math.max(0, fakeCircleRadius ** 2 - clampY ** 2));
            //const sine2: number = Math.pow(y / fakeCircleRadius, 2);
            //const cosine: number = Math.sqrt(1 - sine2);
            setXOffset(centerX + deltaX);
            console.log(`centerX + deltaX = ${centerX + deltaX}`);
        }
    }

    //useEffect(() => {
    //    determineXOffset();
    //}, []);

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
                    generatedLines.push(selection.slice(pos));
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
            ? <span ref={element} className={`flex items-center mb-2`} style={{"--transform-x": `${xOffset}`} as React.CSSProperties}>
                <div
                    className={`link-bubble-tail h-0 w-0 border-r-32 border-t-32 border-t-transparent border-l-transparent border-b-transparent`}
                />
                <div
                    className={`link-bubble-body w-full rounded-2xl mr-4 border-b-2 border-b-transparent border-r-2 border-r-transparent`}>
                    {generatedLines.map((line: string): React.JSX.Element => (
                        <a href={link} className={"pl-4 link-bubble "}>{line}<br/></a>))}
                </div>
            </span>
            :
                <span ref={element} className={`flex items-center mb-2`} style={{"--transform-x": `${xOffset}`} as React.CSSProperties}>
                    <div
                        className={"text-bubble-tail h-0 w-0 border-r-32 border-t-32 border-t-transparent border-l-transparent border-b-transparent"}
                    />
                    <div
                        className={"text-bubble-body w-full rounded-2xl mr-4 border-b-2 border-b-transparent border-r-2 border-r-transparent"}>
                        { generatedLines.map((line: string): React.JSX.Element => (<span className={"pl-4 text-bubble"}>{line}<br/></span>)) }
                    </div>
                </span>
    }

    return (
        <>
            { linkIfDefined() }
        </>
    );
}

export default HeadShotTextBubble;