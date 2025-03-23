import {
  createFilterGroup,
  createSingleFilter,
  type FnSchema,
  presetFilter,
} from "@fn-sphere/filter";
import { z } from "zod";

export const filterSchema = z.object({
  title: z.string().describe("Title"),
  author: z.array(z.string()).describe("Author"),
  tags: z.array(z.string()).describe("Tags"),
  content: z.string().describe("Content"),
  date: z.date().describe("Publication Date"),
  link: z.string().describe("Link"),
  content_length: z.number().describe("Content Length"),
  id: z.string().describe("ID"),
});

export const defaultRule = createFilterGroup({
  op: "and",
  conditions: [
    createSingleFilter({
      path: ["title"],
      name: "contains",
      args: ["Filter Sphere"],
    }),
    createFilterGroup({
      op: "or",
      conditions: [
        createSingleFilter({
          path: ["author"],
          name: "notContains",
          args: ["Author Name"],
        }),
      ],
    }),
  ],
});

const filterPriority = [
  "contains",
  "notContains",
  "startsWith",
  "notStartsWith",
];

export const filterFnList: FnSchema[] = presetFilter
  .filter((fn) => fn.name !== "endsWith")
  .sort((a, b) => {
    const indexA = filterPriority.indexOf(a.name);
    const indexB = filterPriority.indexOf(b.name);
    return (
      (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB)
    );
  });
