export type ColumnType =
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "multi-select"
  | "date";

export type ColumnOption = {
  id: string;
  label: string;
};

export type ColumnDef = {
  id: string;
  name: string;
  type: ColumnType;
  options?: ColumnOption[]; // for select / multi-select
};

export type RowValue = string | number | boolean | string[] | Date | null;

export type RowValues = Record<string, RowValue>;

export type Row = {
  id: string;
  values: RowValues;
};
