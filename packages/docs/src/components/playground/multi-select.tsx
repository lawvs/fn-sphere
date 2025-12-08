import { useState } from "react";
import type { ColumnOption } from "./types";

type Props = {
  options: ColumnOption[];
  value: string[];
  onChange: (val: string[]) => void;
  className?: string;
};

export const MultiSelect = ({
  options,
  value,
  onChange,
  className = "",
}: Props) => {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );
  };

  return (
    <div
      className={`relative ${className}`}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="w-full rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm flex items-center justify-between gap-2 bg-white dark:bg-gray-950 dark:text-gray-100"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="truncate">
          {value.length === 0
            ? "Select options"
            : options
                .filter((o) => value.includes(o.id))
                .map((o) => o.label)
                .join(", ")}
        </span>
        <span className="text-xs text-gray-500">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div
          className="absolute z-10 mt-1 w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="p-2 space-y-2">
            <div className="max-h-48 overflow-auto space-y-1">
              {options.map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer dark:text-gray-200"
                  onClick={() => toggle(opt.id)}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 pointer-events-none"
                    checked={value.includes(opt.id)}
                    readOnly
                  />
                  <span>{opt.label}</span>
                </div>
              ))}
              {options.length === 0 && (
                <div className="text-xs text-gray-500 px-2 py-1">
                  No options
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
