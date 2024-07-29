import type { TypeOf, ZodFunction, ZodTuple, ZodType, ZodTypeAny } from "zod";

/**
 * @internal
 */
export type ZodAnyFunction = ZodFunction<ZodTuple<any, any>, ZodTypeAny>;

export type StandardFnSchema<T extends ZodAnyFunction = ZodAnyFunction> = {
  name: string;
  define: T;
  implement: TypeOf<T>;
  // context?: Record<string, unknown>;
  skipValidate?: boolean;
};

export type GenericFnSchema<
  Generic extends ZodType = any,
  Fn extends ZodAnyFunction = ZodAnyFunction,
> = {
  name: string;
  genericLimit: (t: ZodType) => t is Generic;
  define: (t: Generic) => Fn;
  implement: TypeOf<Fn>;
  skipValidate?: boolean;
};

export type FnSchema = StandardFnSchema | GenericFnSchema;
