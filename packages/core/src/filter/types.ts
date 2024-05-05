import type { ZodTuple, ZodType, ZodTypeAny } from "zod";
import type { StandardFnSchema } from "../types.js";

export type FilterPath = (string | number)[];

export type FilterRuleWrapper<T = unknown> = {
  _state: FilterRule;
  type: "Filter";
  schema: StandardFnSchema;
  /**
   * Field path
   */
  path: FilterPath;
  requiredParameters: ZodTuple;
  setInvert: (invert: boolean) => void;
  isInvert: () => boolean;
  getPlaceholderArguments: () => unknown[];
  ready: () => boolean;
  input: (...args: unknown[]) => void;
  reset: () => void;
  turnToGroup: (op: "and" | "or") => FilterGroup<T>;
  duplicate: () => FilterRuleWrapper<T>;
};

export type FilterField = {
  /**
   * If it's a empty array, it means the root object
   */
  path: FilterPath;
  fieldSchema: ZodType;
  filterList: StandardFnSchema[];
};

/**
 * @deprecated Use {@link FilterField}
 */
export type FilterableField<T = unknown> = {
  /**
   * If it's a empty array, it means the root object
   */
  path: FilterPath;
  fieldSchema: ZodTypeAny;
  filterList: FilterRuleWrapper<T>[];
};

export type FilterId = string & { __filterId: true };

export type FilterGroup<T = unknown> = {
  /**
   * Unique id, used for tracking changes or resorting
   */
  id: FilterId;
  type: "FilterGroup";
  op: "and" | "or";
  conditions: (FilterRuleWrapper<T> | FilterGroup<T>)[];
  invert?: boolean;
};

export type LooseFilterRule = {
  /**
   * Unique id, used for tracking changes or resorting
   */
  id?: FilterId;
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
  arguments: unknown[];
  invert?: boolean;
};

export type LooseFilterGroup = {
  /**
   * Unique id, used for tracking changes or resorting
   */
  id?: FilterId;
  type: "FilterGroup";
  op: "and" | "or";
  conditions: (LooseFilterRule | LooseFilterGroup)[];
  invert?: boolean;
};

/**
 * @deprecated
 */
export type FilterRule = Required<LooseFilterRule>;

export type StrictFilterRule = Readonly<FilterRule>;
export type StrictFilterGroup = Readonly<{
  /**
   * Unique id, used for tracking changes or resorting
   */
  id: FilterId;
  type: "FilterGroup";
  op: "and" | "or";
  conditions: (StrictFilterRule | StrictFilterGroup)[];
  invert: boolean;
}>;

export type SerializedGroup = {
  /**
   * Unique id, used for tracking changes or resorting
   */
  id: FilterId;
  type: "FilterGroup";
  op: "and" | "or";
  conditions: (SerializedGroup | FilterRule)[];
  invert?: boolean;
};
