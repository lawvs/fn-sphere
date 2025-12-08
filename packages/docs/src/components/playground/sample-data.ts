import type { ColumnDef, ColumnOption, Row } from "./types";

const createOptionId = () => Math.random().toString(36).slice(2, 8);
const createRowId = () => Math.random().toString(36).slice(2, 8);

const createSampleOptions = (count: number): ColumnOption[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: createOptionId(),
    label: `Option ${i + 1}`,
  }));

const defaultColumns: ColumnDef[] = [
  { id: "name", name: "Name", type: "text" },
  {
    id: "status",
    name: "Status",
    type: "select",
    options: [
      { id: "in_progress", label: "In Progress" },
      { id: "todo", label: "To Do" },
      { id: "done", label: "Done" },
    ],
  },
  {
    id: "tags",
    name: "Tags",
    type: "multi-select",
    options: createSampleOptions(3),
  },
  { id: "age", name: "Age", type: "number" },
  { id: "active", name: "Active", type: "boolean" },
  { id: "birthday", name: "Birthday", type: "date" },
];

const defaultRows: Row[] = (() => {
  const statusOptions = defaultColumns[1]?.options ?? [];
  const tagOptions = defaultColumns[2]?.options ?? [];
  const tag = (idx: number) => tagOptions[idx % tagOptions.length]?.id;

  return [
    {
      id: createRowId(),
      values: {
        name: "Alex Rivera",
        status: statusOptions[0]?.id ?? null,
        tags: [tag(0), tag(1)].filter(Boolean) as string[],
        age: 28,
        active: true,
        birthday: new Date("1996-02-11"),
      },
    },
    {
      id: createRowId(),
      values: {
        name: "Bianca Lee",
        status: statusOptions[1]?.id ?? null,
        tags: [tag(2)].filter(Boolean) as string[],
        age: 34,
        active: false,
        birthday: new Date("1990-07-04"),
      },
    },
    {
      id: createRowId(),
      values: {
        name: "Charlie Kim",
        status: statusOptions[0]?.id ?? null,
        tags: [tag(1), tag(2)].filter(Boolean) as string[],
        age: 26,
        active: true,
        birthday: new Date("1998-10-22"),
      },
    },
    {
      id: createRowId(),
      values: {
        name: "Drew Patel",
        status: statusOptions[2]?.id ?? null,
        tags: [tag(0)].filter(Boolean) as string[],
        age: 41,
        active: false,
        birthday: new Date("1983-12-09"),
      },
    },
    {
      id: createRowId(),
      values: {
        name: "Emily Zhao",
        status: statusOptions[1]?.id ?? null,
        tags: [tag(2), tag(0)].filter(Boolean) as string[],
        age: 31,
        active: true,
        birthday: new Date("1993-05-27"),
      },
    },
    {
      id: createRowId(),
      values: {
        name: "Fiona Torres",
        status: statusOptions[2]?.id ?? null,
        tags: [tag(1)].filter(Boolean) as string[],
        age: 24,
        active: false,
        birthday: new Date("2000-08-15"),
      },
    },
  ];
})();

export {
  createOptionId,
  createRowId,
  createSampleOptions,
  defaultColumns,
  defaultRows,
};
