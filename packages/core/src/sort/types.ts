import type { $ZodType } from "zod/v4/core";
import type { FilterPath } from "../filter/types.js";
import type { StandardFnSchema } from "../types.js";

export type SortField = {
  path: FilterPath;
  fieldSchema: $ZodType;
  sortFnList: StandardFnSchema[];
};

export type SortItem = {
  path: FilterPath;
  name: string;
  dir: "asc" | "desc";
};

export type SortRule = SortItem[];
