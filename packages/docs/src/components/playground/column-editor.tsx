import { useState } from "react";
import { usePlayground } from "./state";
import type { ColumnOption, ColumnType } from "./types";

const typeOptions: { label: string; value: ColumnType }[] = [
  { label: "Text", value: "text" },
  { label: "Number", value: "number" },
  { label: "Boolean", value: "boolean" },
  { label: "Select", value: "select" },
  { label: "Multi-select", value: "multi-select" },
  { label: "Date", value: "date" },
];

export const ColumnEditor = () => {
  const { columns, addColumn, updateColumn, removeColumn } = usePlayground();
  const [draft, setDraft] = useState({ name: "", type: "text" as ColumnType });

  const onAddOption = (id: string) => {
    const col = columns.find((c) => c.id === id);
    if (!col) return;
    const options: ColumnOption[] = col.options ?? [];
    const next = [
      ...options,
      {
        id: Math.random().toString(36).slice(2, 8),
        label: `Option ${options.length + 1}`,
      },
    ];
    updateColumn(id, { options: next });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {columns.map((col) => (
          <div
            key={col.id}
            className="rounded border border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-900"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <input
                  className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-950 dark:text-gray-100"
                  value={col.name}
                  onChange={(e) =>
                    updateColumn(col.id, { name: e.target.value })
                  }
                />
                <select
                  className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-950 dark:text-gray-100"
                  value={col.type}
                  onChange={(e) =>
                    updateColumn(col.id, { type: e.target.value as ColumnType })
                  }
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="text-xs text-red-600 dark:text-red-400 hover:underline"
                onClick={() => removeColumn(col.id)}
              >
                Remove
              </button>
            </div>
            {(col.type === "select" || col.type === "multi-select") && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Options</span>
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => onAddOption(col.id)}
                  >
                    Add option
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(col.options ?? []).map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-1">
                      <input
                        className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs bg-white dark:bg-gray-950 dark:text-gray-100"
                        value={opt.label}
                        onChange={(e) => {
                          const next = [...(col.options ?? [])];
                          next[idx] = { ...opt, label: e.target.value };
                          updateColumn(col.id, { options: next });
                        }}
                      />
                      <button
                        className="text-[11px] text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        onClick={() => {
                          const next = (col.options ?? []).filter(
                            (o) => o.id !== opt.id,
                          );
                          updateColumn(col.id, { options: next });
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-end gap-2">
        <div className="flex flex-col w-40">
          <label className="text-xs text-gray-500">Name</label>
          <input
            className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-950 dark:text-gray-100"
            value={draft.name}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Column name"
          />
        </div>
        <div className="flex flex-col w-40">
          <label className="text-xs text-gray-500">Type</label>
          <select
            className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-950 dark:text-gray-100"
            value={draft.type}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                type: e.target.value as ColumnType,
              }))
            }
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <button
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
          disabled={!draft.name.trim()}
          onClick={() => {
            addColumn({ name: draft.name.trim(), type: draft.type });
            setDraft({ name: "", type: "text" });
          }}
        >
          Add column
        </button>
      </div>
    </div>
  );
};
