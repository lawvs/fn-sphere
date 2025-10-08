import type { $ZodFunction, $ZodTypes } from "zod/v4/core";

export type StandardFnSchema<T extends $ZodFunction = $ZodFunction> = {
  name: string;
  define: T;
  implement: Parameters<T["implement"]>[0];
  skipValidate?: boolean | undefined;
  meta?: Record<string, unknown>;
};

export type GenericFnSchema<
  DataType extends $ZodTypes = any,
  Fn extends $ZodFunction = $ZodFunction,
> = {
  name: string;
  genericLimit: (t: $ZodTypes) => t is DataType;
  define: (t: DataType) => Fn;
  implement: Parameters<Fn["implement"]>[0];
  skipValidate?: boolean;
  meta?: Record<string, unknown>;
};

export type FnSchema = StandardFnSchema | GenericFnSchema;
