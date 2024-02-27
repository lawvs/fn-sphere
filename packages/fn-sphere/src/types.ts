import type {
  ZodBoolean,
  ZodFunction,
  ZodTuple,
  TypeOf,
  ZodTypeAny,
  ZodType,
} from "zod";

export type ZodAnyFn = ZodFunction<ZodTuple<any, any>, ZodTypeAny>;

export type FnSchema<T extends ZodAnyFn = ZodAnyFn> = {
  name: string;
  define: T;
  implement: TypeOf<T>;
  // context?: Record<string, unknown>;
};

export interface GenericFnSchema<
  Generic extends ZodType = any,
  Fn extends ZodAnyFn = ZodAnyFn,
> {
  name: string;
  genericLimit: (t: ZodType) => t is Generic;
  define: (t: Generic) => Fn;
  implement: TypeOf<Fn>;
}

export type ZodFilterFn = ZodFunction<ZodTuple<any, any>, ZodBoolean>;

export interface FilterFnSchema<T extends ZodFilterFn> extends FnSchema<T> {}

export type FieldFilter<T = unknown> = {
  filterType: "Filter";
  schema: FilterFnSchema<ZodFilterFn>;
  field: string;
  requiredParameters: ZodTuple;
  setInvert: (invert: boolean) => void;
  isInvert: () => boolean;
  getPlaceholderArguments: () => unknown[];
  ready: () => boolean;
  input: (...args: unknown[]) => void;
  reset: () => void;
  turnToGroup: (op: "and" | "or") => FilterGroup<T>;
};

export type FilterableField<T = unknown> = {
  path: string;
  fieldSchema: ZodTypeAny;
  filterList: FieldFilter<T>[];
};

export type FilterGroup<T = unknown> = {
  filterType: "FilterGroup";
  op: "and" | "or";
  conditions: (FieldFilter<T> | FilterGroup<T>)[];
  // isInvert: () => boolean;
  // setInvert: (invert: boolean) => void;
};
