import type {
  FilterField,
  FilterGroup,
  FnSchema,
  LooseFilterRule,
  StandardFnSchema,
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

export type BasicFilterProps<Data = unknown> = {
  schema: ZodType<Data>;
  filterList: FnSchema[];
  /**
   * The maximum depth of searching for filter fields.
   *
   * @default 1
   */
  deepLimit?: number;
  /**
   * Map the filter field to the field name.
   *
   * For example, if the field path is `user.name`, you can map it to `Name`.
   *
   * If not provided, the default map will use the `fieldSchema.description` or the field path as the name.
   */
  mapFieldName?: (field: FilterField) => string;
  /**
   * Map the filter fn schema to the filter label.
   *
   * For example, if the filter name is `eq`, you can map it to `Equal`.
   *
   * If not provided, the default map will use the filter name as the label.
   */
  mapFilterLabel?: (
    filterSchema: StandardFnSchema,
    field: FilterField,
  ) => string;
};
