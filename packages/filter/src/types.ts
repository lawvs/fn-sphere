import type { FilterGroup, FnSchema, LooseFilterRule } from "@fn-sphere/core";
import type { ZodType } from "zod";

/**
 * @deprecated Use {@link LooseFilterGroup} instead.
 */
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
  rule?: FlattenFilterGroup;
  deepLimit?: number;
  onChange?: (rule: FlattenFilterGroup) => void;
};
