import type { FilterGroup, FnSchema, LooseFilterRule } from "@fn-sphere/core";
import type { ZodType } from "zod";

/**
 * @internal
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

export type BasicFilterProps<Data = unknown> = {
  schema: ZodType<Data>;
  filterList: FnSchema[];
  /**
   * The maximum depth of searching for filter fields.
   *
   * @default 1
   */
  deepLimit?: number;
};
