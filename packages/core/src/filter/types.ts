import type { ZodTuple, ZodTypeAny } from "zod";
import type { StandardFnSchema } from "../types.js";

export type Path = (string | number)[];

export type FieldFilter<T = unknown> = {
  _state: unknown;
  type: "Filter";
  schema: StandardFnSchema;
  /**
   * Field path
   */
  field: Path;
  requiredParameters: ZodTuple;
  setInvert: (invert: boolean) => void;
  isInvert: () => boolean;
  getPlaceholderArguments: () => unknown[];
  ready: () => boolean;
  input: (...args: unknown[]) => void;
  reset: () => void;
  turnToGroup: (op: "and" | "or") => FilterGroup<T>;
  duplicate: () => FieldFilter<T>;
};

export type FilterableField<T = unknown> = {
  /**
   * If it's a empty string, it means the root object
   */
  path: Path;
  fieldSchema: ZodTypeAny;
  filterList: FieldFilter<T>[];
};

export type FilterGroup<T = unknown> = {
  _state: unknown;
  type: "FilterGroup";
  op: "and" | "or";
  conditions: (FieldFilter<T> | FilterGroup<T>)[];
  isInvert: () => boolean;
  setInvert: (invert: boolean) => void;
};

export type FilterId = string & { __filterId: true };
export type SerializedRule = {
  /**
   * Unique id, used for tracking changes or resorting
   */
  id: FilterId;
  type: "Filter";
  /**
   * Field path
   */
  field: Path;
  /**
   * Filter name
   */
  name: string;
  arguments: unknown[];
};

export type SerializedGroup = {
  /**
   * Unique id, used for tracking changes or resorting
   */
  id: FilterId;
  type: "FilterGroup";
  op: "and" | "or";
  conditions: (SerializedGroup | SerializedRule)[];
};
