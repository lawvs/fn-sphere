import { useMemo } from "react";
import { MultiSelect } from "./multi-select";
import { usePlayground } from "./state";
import type { ColumnDef, Row, RowValues } from "./types";

type Props = {
  rows: Row[];
  columns: ColumnDef[];
  onChangeRow: (rowId: string, values: RowValues) => void;
  onRemoveRow: (rowId: string) => void;
};

export const DataTable = ({
  rows,
  columns,
  onChangeRow,
  onRemoveRow,
}: Props) => {
  const { addRow } = usePlayground();

  const columnById = useMemo(
    () => Object.fromEntries(columns.map((c) => [c.id, c])),
    [columns],
  );

  const renderCellInput = (row: Row, colId: string) => {
    const col = columnById[colId];
    const value = row.values[colId];
    if (!col) return null;
    const common = {
      className:
        "w-full rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-950 dark:text-gray-100",
    } as const;

    const update = (v: any) =>
      onChangeRow(row.id, { ...row.values, [colId]: v });

    switch (col.type) {
      case "text":
        return (
          <input
            {...common}
            value={(value as string) ?? ""}
            onChange={(e) => update(e.target.value)}
          />
        );
      case "number":
        if (typeof value !== "number" && value !== null) {
          // keep input controlled
        }
        return (
          <input
            {...common}
            type="number"
            value={typeof value === "number" ? value : ""}
            onChange={(e) =>
              update(e.target.value === "" ? null : Number(e.target.value))
            }
          />
        );
      case "boolean":
        return (
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={Boolean(value)}
            onChange={(e) => update(e.target.checked)}
          />
        );
      case "select":
        return (
          <select
            {...common}
            value={(value as string) ?? ""}
            onChange={(e) => update(e.target.value || null)}
          >
            <option value="">(none)</option>
            {(col.options ?? []).map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "multi-select":
        return (
          <MultiSelect
            options={col.options ?? []}
            value={Array.isArray(value) ? (value as string[]) : []}
            onChange={(val) => update(val)}
          />
        );
      case "date":
        const dateString = (() => {
          if (value instanceof Date) return value.toISOString().slice(0, 10);
          if (typeof value === "string" || typeof value === "number") {
            const d = new Date(value);
            return Number.isNaN(d.getTime())
              ? ""
              : d.toISOString().slice(0, 10);
          }
          return "";
        })();
        return (
          <input
            {...common}
            type="date"
            value={dateString}
            onChange={(e) =>
              update(e.target.value ? new Date(e.target.value) : null)
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Rows</h3>
        <button
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
          onClick={addRow}
        >
          Add row
        </button>
      </div>
      <div className="overflow-auto overflow-x-auto rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
          <thead className="bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-2">#</th>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={`px-4 py-2 ${
                    col.type === "boolean" ? "min-w-20" : "min-w-[150px]"
                  }`}
                >
                  {col.name}
                </th>
              ))}
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {rows.map((row, idx) => (
              <tr
                key={row.id}
                className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800"
              >
                <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                  {idx + 1}
                </td>
                {columns.map((col) => (
                  <td key={col.id} className="px-4 py-2 align-top">
                    {renderCellInput(row, col.id)}
                  </td>
                ))}
                <td className="px-4 py-2 text-right">
                  <button
                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    onClick={() => onRemoveRow(row.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
