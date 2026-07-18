import React from "react";
import type { PropsWithChildren } from "react";
import HeadShot from "./HeadShot";
import { useStickyState } from "./useStickyState";
import "./headerStyle.css";

type HeaderProps = PropsWithChildren<{
    stickyTop?: number;
}>;

function Header({stickyTop = 0}: HeaderProps): React.JSX.Element {
    const { sentinelRef, isSticky } = useStickyState(stickyTop);

    return (
        <>
            <HeadShot className={"h-64 w-64 rounded-2xl"}/>

            <div ref={sentinelRef}
                  aria-hidden={true}
                  className={"pointer-events-none h-px w-full -mb-px"}
            />
            <header className={[
                "sticky z-50 h-fit w-full self-start",
                "transition-[background-color,box-shadow,border-color]",
                "duration-300 ease-out",
                isSticky
                    ? "border-b border-zinc-700 bg-zinc-950/95 text-gray-300 shadow-lg backdrop-blur"
                    : "border-b border-transparent bg-transparent"
            ].join(" ")}
            style={{top: stickyTop}}
            data-sticky={isSticky}
            >
                <div className={"flex w-full text-center text-xl tracking-[0.5em] border-b-2 pt-0.5 pb-0.5"}>
                    <div className={[
                        "shrink overflow-hidden",
                        "transition-all duration-300",
                        isSticky
                            ? "mr-1 ml-1 w-10 scale-100 opacity-100"
                            : "mr-0 w-0 scale-75 opacity-0"
                    ].join(" ")}
                    >
                        <HeadShot className={"size-10 rounded-full object-cover"} />
                    </div>
                    <span className={"w-fit pr-2"}> <a href="#">Resume</a> </span>
                    <span className={"w-fit pr-8 border-r-2"}> <a href="#">Email</a> </span>
                    <span className={"w-fit pr-2 pl-8"}> <a href="#">GitHub</a> </span>
                    <span className={"w-fit pr-2"}> <a href="#">Codeberg</a> </span>
                    <span className={"w-fit"}> <a href="#">GitLab</a> </span>
                </div>
            </header>
        </>
    )
}

export default Header;