import type { FilterGroup, FnSchema, LooseFilterRule } from "@fn-sphere/core";
import type { ZodType } from "zod";

export type FlattenFilterGroup = {
  id: FilterGroup["id"];
  type: "FilterGroup";
  op: "or";
  conditions: {
    id: FilterGroup["id"];
    type: "FilterGroup";
    op: "and";
    conditions: LooseFilterRule[];
  }[];
};

export type FilterBuilderProps<Data = unknown> = {
  schema: ZodType<Data>;
  filterList: FnSchema[];
  defaultRule?: FlattenFilterGroup;
  deepLimit?: number;
  onChange?: (filterGroup: FlattenFilterGroup) => void;
};
