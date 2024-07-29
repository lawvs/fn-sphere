import { z, type ZodTypeAny } from "zod";
import { isSameType } from "zod-compare";
import type { FnSchema, StandardFnSchema } from "../types.js";
import { isGenericFilter, unreachable } from "../utils.js";
import type {
  FilterGroup,
  FilterRule,
  SingleFilter,
  StrictFilterGroup,
  StrictFilterRule,
  StrictSingleFilter,
} from "./types.js";
import {
  getFirstParameters,
  getParametersExceptFirst,
  getSchemaAtPath,
  instantiateGenericFn,
} from "./utils.js";

type ValidateSuccess = {
  success: true;
};

type ValidateError = {
  success: false;
  error: Error;
};

/**
 * find filterFnSchema from `filterList` base `rule.name`
 *
 * If filterFnSchema is a generic fn schema,
 * try instantiate generic fn to a StandardFnSchema.
 * The generic type is `getSchemaAtPath(dataSchema, rule.path)`
 */
const getRuleFilterSchemaResult = ({
  filterList,
  dataSchema,
  rule,
}: {
  filterList: FnSchema[];
  dataSchema: ZodTypeAny;
  rule: StrictSingleFilter;
}): (ValidateSuccess & { data: StandardFnSchema }) | ValidateError => {
  const fnSchema = filterList.find((f) => f.name === rule.name);
  if (!fnSchema) {
    return {
      success: false,
      error: new Error(`filterList not have filter: ${rule.name}`),
    };
  }
  const isGeneric = isGenericFilter(fnSchema);
  if (!isGeneric) {
    return {
      success: true,
      data: fnSchema,
    };
  }
  const targetSchema = getSchemaAtPath(dataSchema, rule.path);
  if (!targetSchema) {
    return {
      success: false,
      error: new Error(`Failed to get schema at path ${rule.path.join(".")}`),
    };
  }
  const standardFn = instantiateGenericFn(targetSchema, fnSchema);
  if (!standardFn) {
    return {
      success: false,
      error: new Error("Failed to instantiate generic filter"),
    };
  }
  return {
    success: true,
    data: standardFn,
  };
};

export const getRuleFilterSchema = (payload: {
  rule: StrictSingleFilter;
  filterList: FnSchema[];
  dataSchema: ZodTypeAny;
}) => {
  const result = getRuleFilterSchemaResult(payload);
  if (!result.success) {
    return;
  }
  return result.data;
};

const validateStandardFnRule = ({
  fnSchema,
  dataSchema,
  rule,
}: {
  fnSchema: StandardFnSchema;
  dataSchema: ZodTypeAny;
  rule: StrictSingleFilter;
}): ValidateSuccess | ValidateError => {
  if (rule.name !== fnSchema.name) {
    return {
      success: false,
      error: new Error(
        `rule.name not match fnSchema.name, ${rule.name} !== ${fnSchema.name}`,
      ),
    };
  }
  const targetSchema = getSchemaAtPath(dataSchema, rule.path);
  if (!targetSchema) {
    return {
      success: false,
      error: new Error(`dataSchema not have path: ${rule.path.join(".")}`),
    };
  }
  const dataParameters = getFirstParameters(fnSchema);
  const dataMatchFn = isSameType(dataParameters, targetSchema);
  if (!dataMatchFn) {
    return {
      success: false,
      error: new Error(
        `fnParameters not match dataSchema at path: ${rule.path.join(".")}`,
      ),
    };
  }

  const requiredParameters = getParametersExceptFirst(fnSchema);
  if (!fnSchema.skipValidate) {
    const parseResult = z.tuple(requiredParameters).safeParse(rule.args);
    return parseResult;
  }
  return {
    success: true,
  };
};

export const validateRule = ({
  filterList,
  dataSchema,
  rule,
}: {
  filterList: FnSchema[];
  dataSchema: ZodTypeAny;
  rule: SingleFilter;
}): ValidateSuccess | ValidateError => {
  const fnSchema = filterList.find((f) => f.name === rule.name);
  if (!fnSchema) {
    return {
      success: false,
      error: new Error(`filterList not have filter: ${rule.name}`),
    };
  }
  if (!rule.name) {
    return {
      success: false,
      error: new Error("rule.name not found"),
    };
  }
  if (!rule.path) {
    return {
      success: false,
      error: new Error("rule.path not found"),
    };
  }
  const strictRule: StrictSingleFilter = {
    ...rule,
    name: rule.name,
    path: rule.path,
    invert: !!rule.invert,
  };
  const standardFnResult = getRuleFilterSchemaResult({
    filterList,
    dataSchema,
    rule: strictRule,
  });
  if (!standardFnResult.success) {
    return standardFnResult;
  }
  return validateStandardFnRule({
    fnSchema: standardFnResult.data,
    dataSchema,
    rule: {
      ...rule,
      name: rule.name,
      path: rule.path,
      invert: !!rule.invert,
    },
  });
};

export const isValidRule = ({
  filterList,
  dataSchema,
  rule,
}: {
  filterList: FnSchema[];
  dataSchema: ZodTypeAny;
  rule: SingleFilter;
}): boolean => {
  const result = validateRule({
    filterList,
    dataSchema,
    rule,
  });
  return result.success;
};

export const validateGroup = ({
  filterList,
  dataSchema,
  ruleGroup,
}: {
  filterList: FnSchema[];
  dataSchema: ZodTypeAny;
  ruleGroup: FilterGroup;
}): ValidateSuccess | ValidateError => {
  for (const rule of ruleGroup.conditions) {
    if (rule.type === "FilterGroup") {
      const result = validateGroup({
        filterList,
        dataSchema,
        ruleGroup: rule,
      });
      if (!result.success) {
        return result;
      }
      return result;
    }
    const result = validateRule({
      filterList,
      dataSchema,
      rule,
    });
    if (!result.success) {
      return result;
    }
  }
  return {
    success: true,
  };
};

/**
 * - Remove empty group
 * - Remove invalid filter
 * - If filter is not ready, return `undefined`
 */
export const normalizeFilter = ({
  filterList,
  dataSchema,
  rule,
}: {
  filterList: FnSchema[];
  dataSchema: ZodTypeAny;
  rule: FilterRule;
}): StrictFilterRule | undefined => {
  if (rule.type === "Filter") {
    // User may not select filter name or field
    if (!rule.name || !rule.path) return;
    const result = validateRule({
      filterList,
      dataSchema,
      rule,
    });
    if (!result.success) return;
    return {
      ...rule,
      name: rule.name,
      path: rule.path,
      invert: !!rule.invert,
    } satisfies StrictSingleFilter;
  }
  if (rule.type === "FilterGroup") {
    // if (!rule.conditions.length) return;
    const conditions: StrictFilterRule[] = rule.conditions
      .map((condition) =>
        normalizeFilter({
          filterList,
          dataSchema,
          rule: condition,
        }),
      )
      .filter((i): i is StrictFilterRule => !!i);
    if (!conditions.length) {
      return;
    }
    return {
      ...rule,
      conditions,
      invert: !!rule.invert,
    } satisfies StrictFilterGroup;
  }
  unreachable(rule, "Invalid filter type!");
};
