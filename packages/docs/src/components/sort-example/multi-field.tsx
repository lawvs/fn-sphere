import type { SortItem } from "@fn-sphere/core";
import { createSorterSphere, presetSort } from "@fn-sphere/core";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Table } from "../table";

const schema = z.object({
  department: z.string(),
  name: z.string(),
  age: z.number(),
  score: z.number(),
});

type User = z.infer<typeof schema>;

const users: User[] = [
  { department: "Engineering", name: "Alice", age: 30, score: 88 },
  { department: "Engineering", name: "Bob", age: 25, score: 95 },
  { department: "Design", name: "Charlie", age: 35, score: 72 },
  { department: "Design", name: "Diana", age: 28, score: 91 },
  { department: "Engineering", name: "Eve", age: 32, score: 85 },
  { department: "Marketing", name: "Frank", age: 22, score: 78 },
  { department: "Marketing", name: "Grace", age: 27, score: 93 },
  { department: "Design", name: "Henry", age: 40, score: 67 },
];

const sphere = createSorterSphere(schema, presetSort);
const fields = sphere.findSortableField();
const fieldNames = fields.map((f) => f.path.join("."));

type SortEntry = { field: string; dir: "asc" | "desc" };

const selectClass =
  "rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";
const btnClass =
  "px-2 py-1 text-sm cursor-pointer rounded-md border border-gray-300 shadow-sm transition-colors dark:border-gray-600";
const btnDefault =
  "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700";
const btnDanger =
  "bg-white text-red-600 hover:bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700";
const btnPrimary = "bg-blue-600 text-white hover:bg-blue-700 border-blue-600";

function DirToggle({
  dir,
  onChange,
}: {
  dir: "asc" | "desc";
  onChange: (dir: "asc" | "desc") => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(dir === "asc" ? "desc" : "asc")}
      className={`${btnClass} ${btnDefault} flex items-center gap-1`}
      title={dir === "asc" ? "Ascending" : "Descending"}
    >
      {dir === "asc" ? (
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
        >
          <path d="m3 8 4-4 4 4" />
          <path d="M7 4v16" />
          <path d="M11 12h4" />
          <path d="M11 16h7" />
          <path d="M11 20h10" />
        </svg>
      ) : (
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
        >
          <path d="m3 16 4 4 4-4" />
          <path d="M7 20V4" />
          <path d="M11 4h10" />
          <path d="M11 8h7" />
          <path d="M11 12h4" />
        </svg>
      )}
      {dir === "asc" ? "Asc" : "Desc"}
    </button>
  );
}

export function MultiFieldSortExample() {
  const [sortEntries, setSortEntries] = useState<SortEntry[]>([
    { field: "department", dir: "asc" },
    { field: "name", dir: "asc" },
  ]);

  const addEntry = () => {
    const usedFields = new Set(sortEntries.map((e) => e.field));
    const next = fieldNames.find((n) => !usedFields.has(n));
    if (next) {
      setSortEntries([...sortEntries, { field: next, dir: "asc" }]);
    }
  };

  const removeEntry = (index: number) => {
    setSortEntries(sortEntries.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: string) => {
    const updated = [...sortEntries];
    updated[index] = { ...updated[index]!, field };
    setSortEntries(updated);
  };

  const updateDir = (index: number, dir: "asc" | "desc") => {
    const updated = [...sortEntries];
    updated[index] = { ...updated[index]!, dir };
    setSortEntries(updated);
  };

  const sorted = useMemo(() => {
    const rule: SortItem[] = [];
    for (const entry of sortEntries) {
      const field = fields.find((f) => f.path.join(".") === entry.field);
      if (!field) continue;
      rule.push(sphere.getSortRule(field, field.sortFnList[0]!, entry.dir));
    }
    return sphere.sortData(users, rule);
  }, [sortEntries]);

  const usedFields = new Set(sortEntries.map((e) => e.field));
  const canAdd = fieldNames.some((n) => !usedFields.has(n));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {sortEntries.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-4 shrink-0 text-right">
              {index + 1}.
            </span>
            <select
              value={entry.field}
              onChange={(e) => updateField(index, e.target.value)}
              className={selectClass}
            >
              {fieldNames.map((name) => (
                <option
                  key={name}
                  value={name}
                  disabled={usedFields.has(name) && name !== entry.field}
                >
                  {name}
                </option>
              ))}
            </select>
            <DirToggle
              dir={entry.dir}
              onChange={(dir) => updateDir(index, dir)}
            />
            {sortEntries.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(index)}
                className={`${btnClass} ${btnDanger}`}
                title="Remove"
              >
                X
              </button>
            )}
          </div>
        ))}
        {canAdd && (
          <button
            type="button"
            onClick={addEntry}
            className={`${btnClass} ${btnPrimary} self-start flex items-center gap-1`}
          >
            + Add field
          </button>
        )}
      </div>
      <Table data={sorted} schema={schema} className="max-h-75" />
    </div>
  );
}

export default MultiFieldSortExample;
