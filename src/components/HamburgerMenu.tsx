import { useState } from "react";

const navigationLinks = [
    { label: "Projects", href: "#projects" },
    { label: "About", href: "#about" },
    { label: "Activity", href: "#activity" },
] as const;

type HamburgerMenuProps = {
    buttonClassName?: string;
};

export default function HamburgerMenu({
                                          buttonClassName = "",
                                      }: HamburgerMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    function toggleMenu(): void {
        setIsOpen((current) => !current);
    }

    function closeMenu(): void {
        setIsOpen(false);
    }

    return (
        <div>
            <button
                type="button"
                aria-label={isOpen ? "Close page navigation" : "Open page navigation"}
                aria-expanded={isOpen}
                aria-controls="secondary-page-navigation"
                onClick={toggleMenu}
                className={[
                    "relative flex size-11 shrink-0 items-center justify-center",
                    "text-current transition-colors border-2 border-gray-200 dark:border-gray-300",
                    "focus-visible:outline-2 focus-visible:outline-offset-2",
                    "focus-visible:outline-current",
                    buttonClassName,
                ].join(" ")}
            >
        <span className="sr-only">
          {isOpen ? "Close page navigation" : "Open page navigation"}
        </span>

                <span
                    aria-hidden="true"
                    className={[
                        "absolute h-0.5 w-6 bg-current",
                        "transition-transform duration-300 ease-in-out",
                        "motion-reduce:transition-none",
                        isOpen
                            ? "translate-y-0 rotate-45"
                            : "-translate-y-2 rotate-0",
                    ].join(" ")}
                />

                <span
                    aria-hidden="true"
                    className={[
                        "absolute h-0.5 w-6 bg-current",
                        "transition-opacity duration-200 ease-in-out",
                        "motion-reduce:transition-none",
                        isOpen ? "opacity-0" : "opacity-100",
                    ].join(" ")}
                />

                <span
                    aria-hidden="true"
                    className={[
                        "absolute h-0.5 w-6 bg-current",
                        "transition-transform duration-300 ease-in-out",
                        "motion-reduce:transition-none",
                        isOpen
                            ? "translate-y-0 -rotate-45"
                            : "translate-y-2 rotate-0",
                    ].join(" ")}
                />
            </button>

            <div
                id="secondary-page-navigation"
                className={[
                    /*
                     * inset-x-0 stretches from the left edge to the right edge
                     * of the existing positioned header.
                     */
                    "absolute inset-x-0 top-full z-50",
                    /*
                     * No margin, rounded corners, or detached box styling.
                     * It visually continues the existing navbar.
                     */
                    "grid overflow-hidden",
                    "border-y border-zinc-700",
                    "bg-zinc-950 shadow-md",
                    "transition-[grid-template-rows,opacity]",
                    "duration-300 ease-in-out",
                    "motion-reduce:transition-none",
                    isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "pointer-events-none grid-rows-[0fr] opacity-0",
                ].join(" ")}
            >
                <div className="min-h-0 overflow-hidden">
                    <nav
                        aria-label="Page sections"
                        className="w-full px-6"
                    >
                        <ul className="flex w-full items-center justify-center py-3">
                            {navigationLinks.map((link, index) => (
                                <li
                                    key={link.href}
                                    className="flex items-center"
                                >
                                    {index > 0 && (
                                        <span
                                            aria-hidden="true"
                                            className="mx-6 opacity-40"
                                        >
                                            |
                                        </span>
                                    )}

                                    <a
                                        href={link.href}
                                        onClick={closeMenu}
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
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
}