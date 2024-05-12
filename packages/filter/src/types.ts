import type {
  FilterGroup,
  FnSchema,
  LooseFilterGroup,
  LooseFilterRule,
} from "@fn-sphere/core";
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

export type FilterBuilderProps<Data = unknown> = {
  schema: ZodType<Data>;
  filterList: FnSchema[];
  rule?: LooseFilterGroup;
  deepLimit?: number;
  onChange?: (rule: LooseFilterGroup) => void;
};
