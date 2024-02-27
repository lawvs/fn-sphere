import type { FnSchema } from "./types.js";
import { createFilterSphere } from "./filter/index.js";
import { isSameType } from "zod-compare";
import { z } from "zod";

export function defineTypedFn<
  T extends z.ZodFunction<z.ZodTuple<any, any>, z.ZodTypeAny>,
>(schema: FnSchema<T>[]): FnSchema<T>[];
export function defineTypedFn<
  T extends z.ZodFunction<z.ZodTuple<any, any>, z.ZodTypeAny>,
>(schema: FnSchema<T>): FnSchema<T>;
export function defineTypedFn(schema: any): any {
  return schema;
}

export function defineGenericFn<
  T extends z.ZodFunction<z.ZodTuple<any, any>, z.ZodTypeAny>,
>(schemaFn: (t: T) => FnSchema<T>): (t: T) => FnSchema<T> {
  return schemaFn;
}

export const createFnSphere = () => {
  type FnBoxState = {
    fnMap: Record<string, FnSchema>;
  };
  const state: FnBoxState = {
    fnMap: {},
  };

  const addFn = <F extends FnSchema>(fn: F) => {
    if (fn.name in state.fnMap) {
      throw new Error("Duplicate function name: " + fn.name);
    }
    state.fnMap[fn.name] = fn;
  };

  const registerFnList = (fnList: FnSchema[]) => {
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
  >({
    input,
    output,
  }: {
    input?: Input;
    output?: Output;
  }) => {
    const filterFn = Object.values(state.fnMap).filter((fn) => {
      return (
        (input ? isSameType(input, fn.define.parameters()) : true) &&
        (output ? isSameType(output, fn.define.returnType()) : true)
      );
    });
    return filterFn as FnSchema<z.ZodFunction<Input, Output>>[];
  };

  const setupFilter = <S>(schema: z.ZodType<S>) => {
    // Filter fn should return boolean
    const filterFn = findFn({
      output: z.boolean(),
    });
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
