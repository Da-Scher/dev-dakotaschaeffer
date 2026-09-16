import React, {useCallback} from "react";
import type {NavbarItem} from "./Header";

export interface DropdownMenuProps {
    label: string;
    items: NavbarItem[];
}

function DropdownMenu(props: DropdownMenuProps): React.JSX.Element {
    const [isOpen, setIsOpen] = React.useState(false);
    const closeMenu: () => void= useCallback((): void => {
        setIsOpen(false);
    }, [setIsOpen])
    const toggleMenu: () => void = useCallback((): void => {
        setIsOpen((current: boolean): boolean => !current);
    }, [setIsOpen])
    const {label, items} = props;
    return (
        <div
            className={"relative inline-flex justify-center"}
        >
            <button
                type="button"
                className={"flex items-center justify-center"}
                aria-controls={`${label}-dropdown-menu`}
                aria-expanded={isOpen}
                onClick={toggleMenu}
            >
                <span className={"sr-only"}>{isOpen ? `Close ${label}` : `Open ${label}`}</span>
                <span
                    className={[
                        "h-full w-fit",
                    ].join(' ')}
                >
                    {label}
                </span>
            </button>
            <div
            id={`${label}-dropdown-menu`}
            aria-hidden={!isOpen}
            className={[
                `absolute top-full left-1/2 z-50 mt-2`,
                `w-max min-w-22.5 -translate-x-1/2`,
                `border border-(--main-color-dark)`,
                `bg-(--main-color) text-gray-900 text-sm`,
                `origin-top transition-[transform,opacity]`,
                `duration-300 ease-in-out`,
                `motion-reduce:transition-none`,
                `${isOpen 
                    ? "grid-rows-[1fr] opacity-100 translate-y-0" 
                    : "pointer-events-none grid-rows-[0fr] opacity-0 -translate-y-2"}`
            ].join(' ')}
            >
                <div
                    className={"min-h-0"}
                >
                    <nav
                        aria-label={`${label} links`}

                    >
                        <ul
                            className={"flex flex-col w-full items-center gap-3"}
                        >
                            {items.map((item: NavbarItem, index: number) => (
                                <li key={`${label}-${index}`} className={"px-2"}>
                                    <a href={item.href} onClick={closeMenu}>{item.label}</a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    )
}

export default DropdownMenu;