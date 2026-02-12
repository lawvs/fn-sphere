import { isSameType } from "zod-compare";
import type {
  $ZodFunction,
  $ZodTuple,
  $ZodType,
  $ZodUnknown,
} from "zod/v4/core";
import { createFilterSphere } from "./filter/index.js";
import { isCompareFn, isFilterFn } from "./fn-helpers.js";
import { createSorterSphere } from "./sort/index.js";
import type { GenericFnSchema, StandardFnSchema } from "./types.js";

export const createFnSphere = () => {
  type FnSphereState = {
    fnMap: Record<string, StandardFnSchema>;
    genericFn: Record<string, GenericFnSchema>;
  };
  const state: FnSphereState = {
    fnMap: {},
    genericFn: {},
  };

  // TODO: supports genericFn
  const addFn = <F extends StandardFnSchema>(fn: F) => {
    if (fn.name in state.fnMap || fn.name in state.genericFn) {
      throw new Error("Duplicate function name: " + fn.name);
    }
    state.fnMap[fn.name] = fn;
  };

  const registerFnList = <T extends $ZodFunction>(
    fnList: StandardFnSchema<NoInfer<T>>[],
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
    Input extends $ZodTuple<any, any> = $ZodTuple<any, any>,
    Output extends $ZodType = $ZodUnknown,
  >(
    maybePredicate:
      | {
          input?: Input;
          output?: Output;
        }
      | ((fn: StandardFnSchema) => boolean),
  ) => {
    if (typeof maybePredicate === "function") {
      return Object.values(state.fnMap).filter(maybePredicate);
    }
    const { input, output } = maybePredicate;
    const filterFn = Object.values(state.fnMap).filter((fn) => {
      return (
        (input ? isSameType(input, fn.define._zod.def.input) : true) &&
        (output ? isSameType(output, fn.define._zod.def.output) : true)
      );
    });
    return filterFn as StandardFnSchema<$ZodFunction<Input, Output>>[];
  };

  const setupFilter = <S>(schema: $ZodType<S>) => {
    const filterFn = findFn(isFilterFn);
    const zFilter = createFilterSphere(schema, filterFn);
    return zFilter;
  };

  const setupSort = <S>(schema: $ZodType<S>) => {
    const compareFn = findFn(isCompareFn);
    const zSort = createSorterSphere(schema, compareFn);
    return zSort;
  };

  return {
    _state: state,

    addFn,
    registerFnList,
    getFn,
    removeFn,
    findFn,

    setupFilter,

    setupSort,
  };
};
