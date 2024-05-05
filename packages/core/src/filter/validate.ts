import { type ZodTypeAny } from "zod";
import { isSameType } from "zod-compare";
import type { FnSchema, StandardFnSchema } from "../types.js";
import { isGenericFilter, unreachable } from "../utils.js";
import type {
  LooseFilterGroup,
  LooseFilterRule,
  StrictFilterGroup,
  StrictFilterRule,
} from "./types.js";
import {
  genFilterId,
  getFirstParameters,
  getRequiredParameters,
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
  rule: StrictFilterRule;
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
  rule: StrictFilterRule;
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
  rule: StrictFilterRule;
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
      error: new Error("dataSchema not match fnSchema"),
    };
  }

  const requiredParameters = getRequiredParameters(fnSchema);
  if (!fnSchema.skipValidate) {
    const parseResult = requiredParameters.safeParse(rule.arguments);
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
  rule: LooseFilterRule;
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
  const strictRule: StrictFilterRule = {
    ...rule,
    id: rule.id ?? genFilterId(),
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
      id: rule.id ?? genFilterId(),
      name: rule.name,
      path: rule.path,
      invert: !!rule.invert,
    },
  });
};

export const validateGroup = ({
  filterList,
  dataSchema,
  ruleGroup,
}: {
  filterList: FnSchema[];
  dataSchema: ZodTypeAny;
  ruleGroup: LooseFilterGroup;
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
 */
export const normalizeFilter = ({
  filterList,
  dataSchema,
  rule,
}: {
  filterList: FnSchema[];
  dataSchema: ZodTypeAny;
  rule: LooseFilterGroup | LooseFilterRule;
}): StrictFilterGroup | StrictFilterRule | undefined => {
  if (rule.type === "Filter") {
    const result = validateRule({
      filterList,
      dataSchema,
      rule,
    });
    if (!result.success) return;
    if (!rule.name || !rule.path) return;
    return {
      ...rule,
      id: rule.id ?? genFilterId(),
      name: rule.name,
      path: rule.path,
      invert: !!rule.invert,
    };
  }
  if (rule.type === "FilterGroup") {
    // if (!rule.conditions.length) return;
    const conditions: (StrictFilterGroup | StrictFilterRule)[] = rule.conditions
      .map((condition) =>
        normalizeFilter({
          filterList,
          dataSchema,
          rule: condition,
        }),
      )
      .filter((i): i is StrictFilterGroup | StrictFilterRule => !!i);
    if (!conditions.length) {
      return;
    }
    return {
      ...rule,
      id: rule.id ?? genFilterId(),
      conditions,
      invert: !!rule.invert,
    };
  }
  unreachable(rule, "Invalid filter type!");
};
