import { createContext, useContext, useMemo, useState } from "react";
import { z } from "zod";
import {
  createOptionId,
  createRowId,
  defaultColumns,
  defaultRows,
} from "./sample-data";
import type { ColumnDef, Row } from "./types";

const ColumnTypeSchema = z.enum([
  "text",
  "number",
  "boolean",
  "select",
  "multi-select",
  "date",
]);

type PlaygroundState = {
  columns: ColumnDef[];
  rows: Row[];
  setColumns: (cols: ColumnDef[]) => void;
  setRows: (rows: Row[]) => void;
  addColumn: (col: Omit<ColumnDef, "id">) => void;
  updateColumn: (id: string, patch: Partial<ColumnDef>) => void;
  removeColumn: (id: string) => void;
  addRow: () => void;
  updateRow: (rowId: string, values: Row["values"]) => void;
  removeRow: (rowId: string) => void;
  zodSchema: z.ZodObject<any>;
};

const PlaygroundContext = createContext<PlaygroundState | null>(null);

export const PlaygroundProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [columns, setColumns] = useState<ColumnDef[]>(defaultColumns);
  const [rows, setRows] = useState<Row[]>(defaultRows);

  const zodSchema = useMemo(() => buildSchema(columns), [columns]);

  const addColumn = (col: Omit<ColumnDef, "id">) => {
    const id = createOptionId();
    setColumns((prev) => [...prev, { ...col, id }]);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        values: { ...r.values, [id]: null },
      })),
    );
  };

  const updateColumn = (id: string, patch: Partial<ColumnDef>) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  };

  const removeColumn = (id: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== id));
    setRows((prev) =>
      prev.map((r) => {
        const { [id]: _, ...rest } = r.values;
        return { ...r, values: rest };
      }),
    );
  };

  const addRow = () => {
    const id = createRowId();
    setRows((prev) => [
      ...prev,
      {
        id,
        values: Object.fromEntries(columns.map((c) => [c.id, null])),
      },
    ]);
  };

  const updateRow = (rowIdValue: string, values: Row["values"]) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowIdValue ? { ...r, values } : r)),
    );
  };

  const removeRow = (rowIdValue: string) => {
    setRows((prev) => prev.filter((r) => r.id !== rowIdValue));
  };

  const value: PlaygroundState = {
    columns,
    rows,
    setColumns,
    setRows,
    addColumn,
    updateColumn,
    removeColumn,
    addRow,
    updateRow,
    removeRow,
    zodSchema,
  };

  return (
    <PlaygroundContext.Provider value={value}>
      {children}
    </PlaygroundContext.Provider>
  );
};

export const usePlayground = () => {
  const ctx = useContext(PlaygroundContext);
  if (!ctx) {
    throw new Error("usePlayground must be used within PlaygroundProvider");
  }
  return ctx;
};

function buildSchema(columns: ColumnDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  columns.forEach((col) => {
    switch (col.type) {
      case "text":
        shape[col.id] = z.string().nullable();
        break;
      case "number":
        shape[col.id] = z.number().nullable();
        break;
      case "boolean":
        shape[col.id] = z.boolean().nullable();
        break;
      case "select":
        shape[col.id] = z.string().nullable();
        break;
      case "multi-select":
        shape[col.id] = z.array(z.string()).nullable();
        break;
      case "date":
        shape[col.id] = z.date().nullable();
        break;
      default:
        ColumnTypeSchema.parse(col.type);
        shape[col.id] = z.unknown().nullable();
    }
  });

  return z.object(shape);
}
