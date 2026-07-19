import React from "react";
import type { PropsWithChildren } from "react";
import HeadShot from "./HeadShot";
import HamburgerMenu from "./HamburgerMenu";
import { useStickyState } from "./useStickyState";
import "./headerStyle.css";

type HeaderProps = PropsWithChildren<{
    stickyTop?: number;
}>;

const navbarItems = [
    {label: "Resume", href: "#"},
    {label: "Email", href: "#"},
    {label: "GitHub", href: "#"},
    {label: "GitLab", href: "#"},
    {label: "LinkedIn", href: "#"},
] as const;

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
                "sticky z-50 h-fit w-full self-start overflow-visible bg-zinc-950 text-white",
                "transition-[background-color,box-shadow,border-color]",
                "duration-300 ease-out",
                isSticky
                    ? "border-b border-zinc-700 bg-zinc-950/95 text-gray-300 shadow-lg backdrop-blur"
                    : "border-b border-transparent bg-transparent"
            ].join(" ")}
            style={{top: stickyTop}}
            data-sticky={isSticky}
            >
                <nav className={[
                    "grid grid-row-[1fr] overflow-hidden",
                    "border-y border-zinc-700",
                    "tracking-[0.5em] border-b-2 transition-[grid-template-rows,opacity]",
                    "duration-300 ease-in-out motion-reduce:transition-none"]
                    .join(" ")}
                >

                    <ul className={"flex w-full items-center justify-center py-3"}>
                        <li className={[
                            "flex size-10 origin-center mr-1 ml-1",
                            "transition-[opacity,scale] duration-300 ease-out",
                            "motion-reduce:transition-none",
                            isSticky
                                ? "scale-100 opacity-100"
                                : "pointer-events-none scale-75 opacity-0"
                        ].join(" ")}
                        >
                            <HeadShot className={"size-11 rounded-full object-cover"} />
                        </li>
                        {navbarItems.map((link, index) => (
                            <li
                                key={link.href}
                                className={"flex items-center"}
                            >
                                {index > 0 && (
                                <span
                                    aria-hidden={"false"}
                                    className={"mx-6 opacity-40"}
                                >
                                    |
                                </span>
                                )}
                                <a
                                    href={link.href}
                                    className="
                                        px-3 py-2
                                        font-medium
                                        transition-opacity
                                        hover:opacity-70
                                        focus-visible:outline-2
                                        focus-visible:outline-offset-2
                                        focus-visible:outline-current
                                    "
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                        <li className={"flex items-center"}>
                            <HamburgerMenu />
                        </li>
                    </ul>
                </nav>
            </header>
        </>
    )
}

export default Header;