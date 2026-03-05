import { createSorterSphere, presetSort } from "@fn-sphere/core";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Table } from "../table";

const schema = z.object({
  name: z.string(),
  age: z.number(),
  score: z.number(),
});

type User = z.infer<typeof schema>;

const users: User[] = [
  { name: "Alice", age: 30, score: 88 },
  { name: "Bob", age: 25, score: 95 },
  { name: "Charlie", age: 35, score: 72 },
  { name: "Diana", age: 28, score: 91 },
  { name: "Eve", age: 32, score: 85 },
  { name: "Frank", age: 22, score: 78 },
  { name: "Grace", age: 27, score: 93 },
  { name: "Henry", age: 40, score: 67 },
];

const sphere = createSorterSphere(schema, presetSort);
const fields = sphere.findSortableField();
const fieldNames = fields.map((f) => f.path.join("."));

export function SortExample() {
  const [sortField, setSortField] = useState(fieldNames[0]);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    const field = fields.find((f) => f.path.join(".") === sortField);
    if (!field) return users;
    const firstAvailableFn = field.sortFnList[0]!;
    const rule = [sphere.getSortRule(field, firstAvailableFn, sortDir)];
    return sphere.sortData(users, rule);
  }, [sortField, sortDir]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Sort by
        </label>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          {fieldNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <div className="flex rounded-md border border-gray-300 shadow-sm dark:border-gray-600">
          <button
            type="button"
            onClick={() => setSortDir("asc")}
            className={`px-3 py-1.5 text-sm cursor-pointer rounded-l-md transition-colors ${
              sortDir === "asc"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Asc
          </button>
          <button
            type="button"
            onClick={() => setSortDir("desc")}
            className={`px-3 py-1.5 text-sm cursor-pointer rounded-r-md border-l border-gray-300 dark:border-gray-600 transition-colors ${
              sortDir === "desc"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Desc
          </button>
        </div>
      </div>
      <Table data={sorted} schema={schema} className="max-h-75" />
    </div>
  );
}

export default SortExample;
