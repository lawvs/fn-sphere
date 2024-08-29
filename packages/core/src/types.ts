import type { TypeOf, ZodFunction, ZodTuple, ZodType, ZodTypeAny } from "zod";

/**
 * @internal
 */
export type ZodAnyFunction = ZodFunction<ZodTuple<any, any>, ZodTypeAny>;

export type StandardFnSchema<T extends ZodAnyFunction = ZodAnyFunction> = {
  name: string;
  define: T;
  implement: TypeOf<T>;
  skipValidate?: boolean | undefined;
  meta?: Record<string, unknown>;
};

export type GenericFnSchema<
  DataType extends ZodType = any,
  Fn extends ZodAnyFunction = ZodAnyFunction,
> = {
  name: string;
  genericLimit: (t: ZodType) => t is DataType;
  define: (t: DataType) => Fn;
  implement: TypeOf<Fn>;
  skipValidate?: boolean;
  meta?: Record<string, unknown>;
};

export type FnSchema = StandardFnSchema | GenericFnSchema;
