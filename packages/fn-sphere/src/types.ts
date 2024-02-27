import type {
  ZodBoolean,
  ZodFunction,
  ZodTuple,
  TypeOf,
  ZodTypeAny,
  ZodType,
} from "zod";

export type FnSchema<
  T extends ZodFunction<ZodTuple<any, any>, ZodTypeAny> = ZodFunction<
    ZodTuple<any, any>,
    ZodTypeAny
  >,
> = {
  name: string;
  define: T;
  implement: TypeOf<T>;
  // context?: Record<string, unknown>;
};

export interface GenericFnSchema<
  T extends ZodFunction<ZodTuple<any, any>, ZodTypeAny> = ZodFunction<
    ZodTuple<any, any>,
    ZodTypeAny
  >,
  U extends ZodType = ZodType,
> {
  name: string;
  define: (t: U) => T;
  genericLimit: (t: U) => boolean;
  implement: TypeOf<T>;
}

export type ZodFilterFn = ZodFunction<ZodTuple<any, any>, ZodBoolean>;

export interface InputFilter<T extends ZodFilterFn> extends FnSchema<T> {}

export type FieldFilter<T = unknown> = InputFilter<ZodFilterFn> & {
  filterType: "Filter";
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
