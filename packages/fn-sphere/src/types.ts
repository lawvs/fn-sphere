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
  skipValidate?: boolean;
};

export interface GenericFnSchema<
  Generic extends ZodType = any,
  Fn extends ZodAnyFn = ZodAnyFn,
> {
  name: string;
  genericLimit: (t: ZodType) => t is Generic;
  define: (t: Generic) => Fn;
  implement: TypeOf<Fn>;
  skipValidate?: boolean;
}

export type FieldFilter<T = unknown> = {
  _state: unknown;
  filterType: "Filter";
  schema: FnSchema;
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
  _state: unknown;
  filterType: "FilterGroup";
  op: "and" | "or";
  conditions: (FieldFilter<T> | FilterGroup<T>)[];
  isInvert: () => boolean;
  setInvert: (invert: boolean) => void;
};
