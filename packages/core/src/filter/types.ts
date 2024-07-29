import type { ZodType } from "zod";
import type { StandardFnSchema } from "../types.js";

export type FilterPath = (string | number)[];

export type FilterId = string & {
  // Type differentiator only.
  __filterId: true;
};

export type FilterField = {
  /**
   * If it's a empty array, it means the root object
   */
  path: FilterPath;
  fieldSchema: ZodType;
  filterList: StandardFnSchema[];
};

export interface SingleFilterInput {
  type: "Filter";
  /**
   * Field path
   *
   * If it's a empty array, it means the root object.
   * If not provided, it means user didn't select a field.
   */
  path?: FilterPath;
  /**
   * Filter name
   *
   * If not provided, it means user didn't select a filter.
   */
  name?: string;
  /**
   * Arguments for the filter function
   */
  args: unknown[];
  invert?: boolean;
}

export interface SingleFilter extends SingleFilterInput {
  /**
   * Unique id, used for tracking changes or resorting
   */
  id: FilterId;
}

export interface FilterGroupInput {
  type: "FilterGroup";
  op: "and" | "or";
  conditions: (SingleFilter | FilterGroup)[];
  invert?: boolean;
}

export interface FilterGroup extends FilterGroupInput {
  /**
   * Unique id, used for tracking changes or resorting
   */
  id: FilterId;
}

export type FilterRule = SingleFilter | FilterGroup;

export type StrictSingleFilter = Readonly<Required<SingleFilter>>;
export type StrictFilterGroup = Readonly<{
  /**
   * Unique id, used for tracking changes or resorting
   */
  id: FilterId;
  type: "FilterGroup";
  op: "and" | "or";
  conditions: StrictFilterRule[];
  invert: boolean;
}>;

export type StrictFilterRule = StrictSingleFilter | StrictFilterGroup;
