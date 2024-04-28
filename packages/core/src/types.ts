import type { TypeOf, ZodFunction, ZodTuple, ZodType, ZodTypeAny } from "zod";

/**
 * @internal
 */
export type ZodAnyFn = ZodFunction<ZodTuple<any, any>, ZodTypeAny>;

export type StandardFnSchema<T extends ZodAnyFn = ZodAnyFn> = {
  name: string;
  define: T;
  implement: TypeOf<T>;
  // context?: Record<string, unknown>;
  skipValidate?: boolean;
};

export type GenericFnSchema<
  Generic extends ZodType = any,
  Fn extends ZodAnyFn = ZodAnyFn,
> = {
  name: string;
  genericLimit: (t: ZodType) => t is Generic;
  define: (t: Generic) => Fn;
  implement: TypeOf<Fn>;
  skipValidate?: boolean;
};

export type FnSchema = StandardFnSchema | GenericFnSchema;

export type FieldFilter<T = unknown> = {
  _state: unknown;
  type: "Filter";
  schema: StandardFnSchema;
  field: string;
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
  path: string;
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
  field: string;
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
