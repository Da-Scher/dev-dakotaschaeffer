import React, {useCallback, useLayoutEffect} from "react";
import type { PropsWithChildren } from "react";
import HeadShot from "./HeadShot";
import HamburgerMenu from "./HamburgerMenu";
import { useStickyState } from "./useStickyState";
import "./headerStyle.css";
import "./../index.css";
import HeadShotMini from "./HeadShotMini";
import DropdownMenu from "./DropdownMenu";

type HeaderProps = PropsWithChildren<{
    stickyTop?: number;
}>;

export interface NavbarItem {
    label: string;
    href: string;
    type: string;
    required: boolean;
}

export type Label = "Repos"|"Socials"|"Hamburger"|null;

const navbarItems: NavbarItem[] = [
    {label: "Resume", href: "#", type: "file", required: true},
    {label: "GitHub", href: "#", type: "repository", required: false},
    {label: "Codeberg", href: "#", type: "repository", required: false},
    {label: "LinkedIn", href: "#", type: "social", required: false},
    {label: "Mastadon", href: "#", type: "social", required: false},
] as const;

function Header({stickyTop = 0}: HeaderProps): React.JSX.Element {
    const { sentinelRef, isSticky } = useStickyState(stickyTop);
    const [screenType, setScreenType] = React.useState<"mobile" | "tablet" | "desktop">(
        window.screen.width >= 1024 ? "desktop" : window.screen.width >= 768 ? "tablet" : "mobile"
    )
    const [activeDropdown, setActiveDropdownOpen] = React.useState<Label>(null);
    const handleClickOpen: (label: Label) => void = useCallback((label: Label): void => {
        setActiveDropdownOpen(
            (currentLabel: Label): Label => currentLabel === label
                ? null
                : label
        );
    }, []);

    const closeMenus: () => void = useCallback((): void => {
        setActiveDropdownOpen(null);
    }, []);

    const updateScreenType: () => void = useCallback((): void => {
        setScreenType(
            window.screen.width >= 1024 ? "desktop" : window.screen.width >= 768 ? "tablet" : "mobile"
        );
    }, [setScreenType]);

    useLayoutEffect((): () => void => {
        window.addEventListener("resize", updateScreenType);

        return (): void => {
            window.removeEventListener("resize", updateScreenType);
        }
    }, [updateScreenType]);

    return (
        <>
            <HeadShot className={
                [
                    "ml-4 mt-9 mb-11 h-48 w-48 rounded-full border-2 border-[#999999]",
                    "md:ml-11"
                ].join(" ")
            }/>

            <div className={"bar border-b-2 mb-5.25 mx-4.25"} />
            <div ref={sentinelRef}
                  aria-hidden={true}
                  className={"pointer-events-none h-px w-full -mb-px"}
            />
            <header className={[
                "sticky z-50 h-fit w-full self-start overflow-visible",
                "text-xl",
                "transition-[background-color,box-shadow,border-color,opacity]",
                "duration-300 ease-out",
                isSticky
                    ? "font-sans border-b border-b-(--accent-color-dark) bg-(--accent-color) text-gray-900 shadow-lg backdrop-blur"
                    : "border-b border-transparent bg-transparent"
            ].join(" ")}
            style={{top: stickyTop}}
            data-sticky={isSticky}
            >
                <nav className={[
                    "grid grid-row-[1fr] w-full",
                    "border-y border-zinc-700",
                    "bg-(--accent-color) text-gray-900",
                    "tracking-[0.5em] border-b-2 transition-[grid-template-rows]",
                    "duration-300 ease-in-out motion-reduce:transition-none",
                    ]
                    .join(" ")}
                >

                    <ul className={`flex w-full items-center ${screenType === "desktop" ? "justify-start gap-8" : "justify-center gap-4"} py-3 font-sans tracking-wide text-xl`}>
                        <li className={[
                            `flex ${isSticky ? "size-10" : "size-0"} origin-center mr-1 ml-1`,
                            "transition-[opacity,scale] duration-300 ease-out",
                            "motion-reduce:transition-none",
                            isSticky
                                ? "scale-100 opacity-100"
                                : "pointer-events-none scale-75 opacity-0"
                        ].join(" ")}
                        >
                            <HeadShotMini className={"size-11 rounded-full object-cover"} />
                        </li>
                        {screenType === "mobile" && [
                            navbarItems.reduce((requiredItems: NavbarItem[], currentItem: NavbarItem): NavbarItem[] => {
                                if (currentItem.required) requiredItems.push(currentItem);
                                return requiredItems;
                            }, []),
                            navbarItems.reduce((repositoryItems: NavbarItem[], currentItem: NavbarItem): NavbarItem[] => {
                                if (currentItem.type === "repository") repositoryItems.push(currentItem);
                                return repositoryItems;
                            }, []),
                            navbarItems.reduce((socialItems: NavbarItem[], currentItem: NavbarItem): NavbarItem[] => {
                                if (currentItem.type === "social") socialItems.push(currentItem);
                                return socialItems;
                            }, [])].map((item: NavbarItem | NavbarItem[], index: number): React.JSX.Element => {
                                if (Array.isArray(item)) {
                                    console.log(item)
                                    if (item[0].required) {
                                        return (
                                            <>
                                                {item.map((requiredItem: NavbarItem, requiredIndex: number): React.JSX.Element => (
                                                    <li
                                                        key={`required-${requiredItem.type}-${requiredIndex}`}
                                                    >
                                                        {requiredIndex > 0 ? <span><span>|</span>{requiredItem.label}</span> : <span>{requiredItem.label}</span>}
                                                    </li>
                                                ))}
                                            </>
                                        );
                                    }
                                    else {
                                        if (item[0].type === "repository") {
                                            return (
                                                <li
                                                    key={`repository-${index}`}
                                                    className={"min-w-22.5"}
                                                >
                                                    {index > 0 ? <span><span className={"pr-4"}>|</span><DropdownMenu label={"Repos"} items={item} isOpen={activeDropdown === "Repos"} onToggle={handleClickOpen} onClose={closeMenus}/></span> : <span><DropdownMenu label={"Repos"} items={item} isOpen={activeDropdown === "Socials"} onToggle={handleClickOpen} onClose={closeMenus} /></span>}
                                                </li>
                                            );
                                        }
                                        else if (item[0].type === "social") {
                                            return (
                                                <li
                                                    key={`repository-${index}`}
                                                    className={"min-w-22.5"}
                                                >
                                                    {index > 0 ? <span><span className={"pr-4"}>|</span><DropdownMenu label={"Socials"} items={item} isOpen={activeDropdown === "Socials"} onToggle={handleClickOpen} onClose={closeMenus}/></span> : <span><DropdownMenu label={"Socials"} items={item} isOpen={activeDropdown === "Socials"} onToggle={handleClickOpen} onClose={closeMenus} /></span>}
                                                </li>
                                            );
                                        }
                                        else return <li></li>
                                    }
                                }
                                else {
                                    if (item.required) {
                                        return (
                                            <li
                                                key={`${item.type}-${index}`}
                                            >
                                                {item.label}
                                            </li>
                                        );
                                    }
                                    else {
                                        if (item.type === "repository") {
                                            return (
                                                <li
                                                    key={`${item.type}-${index}`}
                                                >
                                                    {item.label}
                                                </li>
                                            );
                                        }
                                        else if (item.type === "social") {
                                            return (
                                                <li
                                                    key={`${item.type}-${index}`}
                                                >
                                                    {item.label}
                                                </li>
                                            );
                                        }
                                        else return <li></li>
                                    }
                                }
                        })}
                        {(screenType === "tablet" || screenType === "desktop") && navbarItems.map((item: NavbarItem, index: number): React.ReactElement => (
                            <li
                                key={`${index}`}
                            >
                                {index > 0 ? <span><span className={`${screenType === "tablet" ? "px-4" : "px-8"}`}>|</span>{item.label}</span> : <span>{item.label}</span>}
                            </li>
                        ))}
                        <li className={"items-center justify-center px-2"}>
                            <HamburgerMenu isOpen={activeDropdown === "Hamburger"} toggleMenu={handleClickOpen} onClose={closeMenus}/>
                        </li>
                    </ul>
                </nav>
            </header>
        </>
    )
}

export default Header;