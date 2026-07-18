import React from "react";
import "./headerStyle.css";

type HeadShotProps = {
    className?: string;
};

function HeadShot({className = ""}: HeadShotProps): React.JSX.Element {
    return (
        <img
            src={"./../public/EXAMPLE_pp.png"}
            alt={"Firstname Lastname"}
            className={className}
        />
    )
}

export default HeadShot;