import React from "react";
import HeadShotTextBubble from "./HeadShotTextBubble";

function TextBubbleSection(): React.JSX.Element {
    return (
        <div className={"flex flex-col w-full"}>
            <HeadShotTextBubble text={"Lorem ipsum dolor sit amet, consectetur massa nunc."} lineSize={16} lines={3}/>
            <HeadShotTextBubble text={"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut quis dui at diam laoreet ultrices. Sed tristique sollicitudin quam sit amet tempus. Etiam urna lorem."} lineSize={16} lines={3}/>
            <HeadShotTextBubble text={"Lorem ipsum dolor sit amet."} lineSize={16} lines={3}/>
        </div>
    );
}

export default TextBubbleSection;