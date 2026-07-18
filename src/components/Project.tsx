import React from "react";

interface ProjectProps extends React.HTMLProps<HTMLDivElement> {
    Descr: string;
    Name: string;
    When: Date;
    Bullets: string[];
}

function Project ({Descr, Name, When, Bullets}: ProjectProps): React.JSX.Element {
    return (
        <div className={"bg-gray-400 text-black grid grid-cols-2 grid-rows-5 rounded-2xl border-2 border-gray-100"}>
            <h3 className={"col-start-1 row-start-1 text-left pl-4"}>{Descr}</h3>
            <p className={"row-start-2 col-start-1 text-left pl-4"}>{Name}</p>
            <p className={"row-start-1 col-start-2 text-right pr-4"}>{When.getFullYear()}</p>
            <ul className={"text-left pl-4 row-start-3 row-end-6 row-span-3"}>
                {Bullets.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

export default Project;