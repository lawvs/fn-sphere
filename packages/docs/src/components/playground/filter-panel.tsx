import {
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
} from "@fn-sphere/filter";
import { useMemo } from "react";
import type { ZodType } from "zod";
import { DataTable } from "./data-table";
import { usePlayground } from "./state";
import type { ColumnDef, RowValues } from "./types";

export const FilterPanel = () => {
  const { columns, rows, updateRow, removeRow, zodSchema } = usePlayground();

  const mapFieldName = (field: { path: (string | number)[] }) => {
    const id = field.path[0];
    const col = columns.find((c) => c.id === id);
    if (!col) {
      console.warn(`Column not found!`, id, columns);
    }
    return col?.name ?? String(id);
  };

  const { predicate, context } = useFilterSphere<RowValues>({
    schema: zodSchema as unknown as ZodType<RowValues>,
    mapFieldName,
  });

  const filtered = useMemo(
    () => rows.filter((row) => predicate(row.values as RowValues)),
    [rows, predicate],
  );

  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Filter</h3>
          <div className="text-xs text-gray-500">{columns.length} fields</div>
        </div>
        <FilterSphereProvider context={context}>
          <FilterBuilder />
        </FilterSphereProvider>
      </div>
      <div className="rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 p-4 min-w-0">
        <DataTable
          rows={filtered}
          columns={columns as ColumnDef[]}
          onChangeRow={(rowId, values) => updateRow(rowId, values)}
          onRemoveRow={removeRow}
        />
      </div>
    </div>
  );
};
