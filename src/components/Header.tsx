import React from "react";
import HeadShot from "./HeadShot";

function Header(): React.JSX.Element {
    return (
        <header className={"grid grid-cols-1 justify-items-center gap-4"}>
            <HeadShot />
            <div className={"w-full text-center text-2xl tracking-[0.5em] border-b-2 pt-0.5 pb-0.5"}>
                <span> <a href="#">Resume</a> </span>
                <span className={"border-r-2"}> <a href="#">Email</a> </span>
                <span className={"pl-8"}> <a href="#">GitHub</a> </span>
                <span> <a href="#">Codeberg</a> </span>
                <span> <a href="#">GitLab</a> </span>
            </div>
        </header>
    )
}

export default Header;