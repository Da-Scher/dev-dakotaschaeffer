import React from "react";
import type {NavbarItem} from "./Header";
import type {Label} from "./Header";

export interface DropdownMenuProps {
    label: Label;
    items: NavbarItem[];
    isOpen: boolean;
    onToggle: (label: Label) => void;
    onClose: () => void;
}

function DropdownMenu(props: DropdownMenuProps): React.JSX.Element {
    const {label, items, isOpen, onToggle, onClose} = props;
    const menuId: string = `${label}-dropdown-menu`;
    return (
        <div
            className={"relative inline-flex justify-center"}
        >
            <button
                type="button"
                className={"flex items-center justify-center"}
                aria-controls={menuId}
                aria-expanded={isOpen}
                onClick={() => onToggle(label)}
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
            id={menuId}
            aria-hidden={!isOpen}
            className={[
                `absolute top-full left-1/2 z-50 mt-2`,
                `min-w-24 -translate-x-1/2`,
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
                                    <a href={item.href} onClick={onClose}>{item.label}</a>
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