import type { FnSchema, GenericFnSchema, ZodAnyFn } from "./types.js";
import { createFilterSphere } from "./filter/index.js";
import { isSameType } from "zod-compare";
import { z } from "zod";
import { isFilterFn as isFilterSchema } from "./utils.js";

export function defineTypedFn<
  T extends z.ZodFunction<z.ZodTuple<any, any>, z.ZodTypeAny>,
>(schema: FnSchema<T>[]): FnSchema<T>[];
export function defineTypedFn<
  T extends z.ZodFunction<z.ZodTuple<any, any>, z.ZodTypeAny>,
>(schema: FnSchema<T>): FnSchema<T>;
export function defineTypedFn<T>(schema: T) {
  return schema;
}

export function defineGenericFn<
  Generic extends z.ZodType,
  Fn extends z.ZodFunction<z.ZodTuple<any, any>, z.ZodTypeAny>,
>(schemaFn: GenericFnSchema<Generic, Fn>): GenericFnSchema<Generic, Fn>;
export function defineGenericFn<
  Generic extends z.ZodType,
  Fn extends z.ZodFunction<z.ZodTuple<any, any>, z.ZodTypeAny>,
>(schemaFn: GenericFnSchema<Generic, Fn>[]): GenericFnSchema<Generic, Fn>[];
export function defineGenericFn<T>(schemaFn: T) {
  return schemaFn;
}

export const createFnSphere = () => {
  type FnBoxState = {
    fnMap: Record<string, FnSchema>;
    genericFn: Record<string, GenericFnSchema>;
  };
  const state: FnBoxState = {
    fnMap: {},
    genericFn: {},
  };

  const addFn = <F extends FnSchema>(fn: F) => {
    if (fn.name in state.fnMap || fn.name in state.genericFn) {
      throw new Error("Duplicate function name: " + fn.name);
    }
    state.fnMap[fn.name] = fn;
  };

  const registerFnList = <T extends ZodAnyFn>(
    fnList: FnSchema<NoInfer<T>>[],
  ) => {
    fnList.forEach((fn) => {
      addFn(fn);
    });
  };

  const removeFn = (fnName: string) => {
    delete state.fnMap[fnName];
  };

  const getFn = (fnName: string) => {
    if (fnName in state.fnMap) {
      return state.fnMap[fnName];
    }
  };

  const findFn = <
    Input extends z.ZodTuple<any, any> = z.ZodTuple<any, any>,
    Output extends z.ZodType = z.ZodUnknown,
  >(
    maybePredicate:
      | {
          input?: Input;
          output?: Output;
        }
      | ((fn: FnSchema) => boolean),
  ) => {
    if (typeof maybePredicate === "function") {
      return Object.values(state.fnMap).filter(maybePredicate);
    }
    const { input, output } = maybePredicate;
    const filterFn = Object.values(state.fnMap).filter((fn) => {
      return (
        (input ? isSameType(input, fn.define.parameters()) : true) &&
        (output ? isSameType(output, fn.define.returnType()) : true)
      );
    });
    return filterFn as FnSchema<z.ZodFunction<Input, Output>>[];
  };

  const setupFilter = <S>(schema: z.ZodType<S>) => {
    const filterFn = findFn(isFilterSchema);
    const zFilter = createFilterSphere(schema, filterFn);
    return zFilter;
  };

  return {
    _state: state,

    addFn,
    registerFnList,
    getFn,
    removeFn,
    findFn,

    setupFilter,
  };
};
