import { useEffect, useRef, useState } from "react";

const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const SortIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m3 16 4 4 4-4" />
    <path d="M7 20V4" />
    <path d="m21 8-4-4-4 4" />
    <path d="M17 4v16" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0 ml-auto text-(--sl-color-text-accent)"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ChevronsUpDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0 text-(--sl-color-gray-3)"
    aria-hidden="true"
  >
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </svg>
);

const modules = [
  {
    label: "Filter",
    description: "Dynamic filtering interfaces",
    href: "/fn-sphere/guides/introduction/",
    icon: FilterIcon,
  },
  {
    label: "Sort",
    description: "Schema-driven sorting",
    href: "/fn-sphere/sort/getting-started/",
    icon: SortIcon,
  },
];

export function ModuleSelector({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isSortModule = slug.startsWith("sort");
  const current = isSortModule ? modules[1]! : modules[0]!;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="pb-3 mb-3 border-b border-(--sl-color-hairline)">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-2 px-2.5 py-2 border border-(--sl-color-hairline-light) rounded-lg bg-(--sl-color-bg-nav) text-(--sl-color-white) transition-colors hover:bg-(--sl-color-hairline-light) cursor-pointer"
        >
          <current.icon />
          <span className="flex-1 text-sm font-medium text-left">
            {current.label}
          </span>
          <ChevronsUpDown />
        </button>

        {open && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 p-1 border border-(--sl-color-hairline-light) rounded-xl bg-(--sl-color-bg-nav) backdrop-blur-lg shadow-lg flex flex-col gap-1">
            {modules.map((mod) => {
              const isActive =
                mod.label === "Sort" ? isSortModule : !isSortModule;
              return (
                <a
                  key={mod.label}
                  href={mod.href}
                  className="flex items-center gap-2 p-2 rounded-lg no-underline text-(--sl-color-white) transition-colors hover:bg-(--sl-color-hairline-light)"
                >
                  <div className="shrink-0 flex items-center justify-center size-5">
                    <mod.icon />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight m-0">
                      {mod.label}
                    </p>
                    <p className="text-xs text-(--sl-color-gray-3) mt-0.5 m-0">
                      {mod.description}
                    </p>
                  </div>
                  {isActive && <CheckIcon />}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
