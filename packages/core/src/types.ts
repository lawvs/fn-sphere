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
