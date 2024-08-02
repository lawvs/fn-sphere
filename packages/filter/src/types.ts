import type {
  FilterField,
  FilterGroup,
  FilterId,
  FnSchema,
  SingleFilter,
  StandardFnSchema,
} from "@fn-sphere/core";
import type { ZodType } from "zod";

/**
 * @internal
 * @deprecated
 */
export type FlattenFilterGroup = {
  id: FilterId;
  type: "FilterGroup";
  op: "or";
  conditions: {
    id: FilterId;
    type: "FilterGroup";
    op: "and";
    conditions: SingleFilter[];
  }[];
};

export interface BasicFilterSphereInput<Data = unknown> {
  /**
   * The filter rule.
   */
  filterRule: FilterGroup;
  /**
   * The schema of the data to be filtered.
   */
  schema: ZodType<Data>;
  /**
   * The list of filter functions schema.
   *
   * If not provided, the `presetFilter` will be used.
   */
  filterList?: FnSchema[];
  /**
   * The maximum nesting depth limit of the filter rule.
   *
   * @default 2
   */
  // maxNestedDepth?: number;
  /**
   * The maximum depth of searching for filter fields.
   *
   * @default 1
   */
  fieldDeepLimit?: number;
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
  mapFilterName?: (
    filterSchema: StandardFnSchema,
    field: FilterField,
  ) => string;
  /**
   * The callback when the filter rule changes.
   */
  onRuleChange?: (rule: FilterGroup) => void;
}

export type BasicFilterSphereProps<Data = unknown> = Required<
  BasicFilterSphereInput<Data>
>;
