import React from "react";
import "./../index.css";
import "./headerStyle.css";

export interface HeadShotBubbleProps {
    text: string;
    lineSize: number;
    lines: number;
}

function lineCutOff(line: string, start: number, lineLength: number): string {
    console.log(`lineCutOff(line = "${line}", start = ${start}, lineLength = ${lineLength}).`);
    let returnLine: string = line.slice(start);
    let ellipsesIndex: number = 0;
    /* consectetur adipiscing blah -> consectetur adipiscing ... -> consectetur ... */
    while (returnLine.length > lineLength) {
        console.log(`lineCutOff(line = "${line}", start = ${start}, lineLength = ${lineLength}) loop. (returnLine.length = ${returnLine.length}) > (lineLength = ${lineLength})`);
        console.log(`returnLine = ${returnLine}`);
        if (returnLine.length === lineLength) {
            console.log(`lineCutOff(line, start = ${start}, lineLength = ${lineLength}) exact case.`);
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
        console.log(`returnLine = ${returnLine}`);
    }
    return returnLine;
}

function HeadShotTextBubble(props: HeadShotBubbleProps): React.JSX.Element {
    const {text, lineSize, lines} = props;

    const threeLines: Array<string> = ((text: string, lineSize: number, lines: number): Array<string> => {
        const ellipseRequired: boolean = text.length > lineSize * lines;
        const selection: string = text.length > lineSize * lines
            ? text[lineSize * lines] === " "
                ? text.slice(0, lineSize * lines)
                : text.slice(0, text.lastIndexOf(" ", lineSize * lines))
            : text
        let pos: number = 0;
        const threeLines: Array<string> = [];
        for (let i: number = 0; i < lines; i++) {
            if (i !== lines - 1) {
                const idx: number = selection.lastIndexOf(" ", lineSize * (i + 1));
                console.log(selection.slice(pos))
                if (selection.slice(pos).length < lineSize) {
                    threeLines.push(selection.slice(pos));
                    break;
                }
                threeLines.push(selection.slice(pos, idx));
                pos = idx;
            }
            else {
                if (pos === selection.length) console.log('easy?');
                console.log( "i = lines - 1")
                if (ellipseRequired) {
                    const lastLine: string = lineCutOff(selection, pos, lineSize)
                    if (!lastLine.endsWith(" ...")) {
                        threeLines.push(lastLine + " ...");
                    }
                    else threeLines.push(lineCutOff(selection, pos, lineSize))
                }
                else threeLines.push(lineCutOff(selection, pos, lineSize))
            }
        }
        return threeLines;

    })(text, lineSize, lines);

    return (
        <span className={"flex items-center mb-2"}>
            <div className={"text-bubble-tail h-0 w-0 border-r-[32px] border-t-[32px] border-b-[0px] border-t-transparent border-l-transparent border-t-transparent border-b-transparent"}></div>
            <div className={"text-bubble-body w-full rounded-2xl mr-4 border-b-2 border-b-transparent border-r-2 border-r-transparent"}>
                <span className={"pl-4 text-bubble"}>{threeLines[0]}<br/></span>
                <span className={"pl-4 text-bubble"}>{threeLines[1]}<br/></span>
                <span className={"pl-4 text-bubble"}>{threeLines[2]}<br/></span>
            </div>
        </span>
    );
}

export default HeadShotTextBubble;