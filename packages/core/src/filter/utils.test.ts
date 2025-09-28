import { describe, expect, it } from "vitest";
import z from "zod";
import { isSameType } from "zod-compare";
import { defineGenericFn, defineTypedFn } from "../fn-sphere.js";
import type { FnSchema, GenericFnSchema } from "../types.js";
import type { FilterPath } from "./types.js";
import {
  countNumberOfRules,
  countValidRules,
  createFilterGroup,
  createSingleFilter,
  getFirstParameters,
  getParametersExceptFirst,
  getSchemaAtPath,
  getValueAtPath,
  instantiateGenericFn,
} from "./utils.js";

describe("getValueFromPath", () => {
  it("should return the correct value for a given path", () => {
    const obj = {
      selector: { to: { val: "val" } },
      target: [1, 2, { a: "test" }],
    };

    expect(getValueAtPath(obj, ["selector", "to", "val"] as FilterPath)).toBe(
      "val",
    );
    expect(getValueAtPath(obj, ["target", 2, "a"] as FilterPath)).toBe("test");
  });

  it("should return undefined if the path does not exist", () => {
    const obj = { a: { b: { c: "value" } } };

    expect(getValueAtPath(obj, ["a", "b", "d"] as FilterPath)).toBeUndefined();
    expect(getValueAtPath(obj, ["a", "c", "d"] as FilterPath)).toBeUndefined();
  });

  it("should return the whole object if no path is provided", () => {
    const obj = { a: 1, b: 2 };

    expect(getValueAtPath(obj, [] as unknown as FilterPath)).toEqual(obj);
  });
});

describe("getSchemaFromPath", () => {
  it("should return the correct schema for a given path", () => {
    const schema = z.object({
      a: z.object({
        b: z.string(),
      }),
    });

    expect(
      getSchemaAtPath(schema, ["a", "b"] as FilterPath)?._zod.def.type,
    ).toEqual("string");
  });

  it("should return undefined if the path does not exist", () => {
    const schema = z.object({
      a: z.object({
        b: z.string(),
      }),
    });

    expect(getSchemaAtPath(schema, ["a", "c"] as FilterPath)).toBeUndefined();
  });

  it("should return the whole schema if no path is provided", () => {
    const schema = z.object({
      a: z.object({
        b: z.string(),
      }),
    });

    expect(getSchemaAtPath(schema, [] as unknown as FilterPath)).toEqual(
      schema,
    );
  });
});

describe("getFirstParameters getParametersExceptFirst", () => {
  it("should return the correct parameters except the first one", () => {
    const schema = {
      name: "test",
      define: z.function({
        input: [z.number(), z.boolean()],
        output: z.void(),
      }),
      implement: () => {},
    };
    expect(isSameType(getFirstParameters(schema), z.number())).toEqual(true);
    expect(
      isSameType(
        z.tuple(getParametersExceptFirst(schema)),
        z.tuple([z.boolean()]),
      ),
    ).toEqual(true);
  });

  it("should return the parameters except the first one", () => {
    const schema = {
      name: "test",
      define: z.function({
        input: [z.number(), z.boolean(), z.string()],
        output: z.void(),
      }),
      implement: () => {},
    };
    expect(isSameType(getFirstParameters(schema), z.number())).toEqual(true);
    expect(
      isSameType(
        z.tuple(getParametersExceptFirst(schema)),
        z.tuple([z.boolean(), z.string()]),
      ),
    ).toEqual(true);
  });

  it("should return empty array when only one parameter", () => {
    const schema = {
      name: "test",
      define: z.function({ input: [z.number()], output: z.void() }),
      implement: () => {},
    };
    expect(isSameType(getFirstParameters(schema), z.number())).toEqual(true);
    expect(getParametersExceptFirst(schema)).toEqual([]);
  });

  it("should throw an error when no parameters", () => {
    const schema = {
      name: "test",
      define: z.function({ input: [], output: z.void() }),
      implement: () => {},
    };
    expect(() => getFirstParameters(schema)).toThrowError();
    expect(() => getParametersExceptFirst(schema)).toThrowError(
      "Invalid fnSchema parameters!",
    );
  });
});

describe("countNumberOfRules", () => {
  it("should return 0 for empty filter group", () => {
    const rule = createFilterGroup();
    const result = countNumberOfRules(rule);
    expect(result).toBe(0);

    const rule2 = createFilterGroup({
      op: "and",
      conditions: [
        createFilterGroup({
          op: "or",
          conditions: [
            createFilterGroup({
              op: "or",
              conditions: [],
            }),
          ],
        }),
      ],
    });
    expect(countNumberOfRules(rule2)).toBe(0);
  });

  it("should return 1 for a single rule", () => {
    const rule = createSingleFilter();
    expect(countNumberOfRules(rule)).toBe(1);
  });

  it("should return 2 for a group with 2 rules", () => {
    const rule = createFilterGroup({
      op: "and",
      conditions: [createSingleFilter(), createSingleFilter()],
    });
    expect(countNumberOfRules(rule)).toBe(2);
  });

  it("should return 3 for a group with 2 rules and a group with 1 rule", () => {
    const rule = createFilterGroup({
      op: "and",
      conditions: [
        createSingleFilter(),
        createSingleFilter(),
        createFilterGroup({
          op: "or",
          conditions: [createSingleFilter()],
        }),
      ],
    });
    expect(countNumberOfRules(rule)).toBe(3);
  });

  it("should return 1 for a nested rule", () => {
    const rule = createFilterGroup({
      op: "and",
      conditions: [
        createFilterGroup({
          op: "or",
          conditions: [
            createFilterGroup({
              op: "or",
              conditions: [
                createFilterGroup({
                  op: "or",
                  conditions: [createSingleFilter()],
                }),
              ],
            }),
          ],
        }),
      ],
    });
    expect(countNumberOfRules(rule)).toBe(1);
  });
});

describe("countValidRules", () => {
  const mockDataSchema = z.object({
    name: z.string(),
    boolean: z.boolean(),
  });

  const filterFnList: FnSchema[] = [
    defineTypedFn({
      name: "Starts with",
      define: z.function({
        input: [z.string(), z.string()],
        output: z.boolean(),
      }),
      implement: (value, target) => value.startsWith(target),
      skipValidate: true,
    }),
    defineTypedFn({
      name: "Is checked",
      define: z.function({ input: [z.boolean()], output: z.boolean() }),
      implement: (value) => value === true,
      skipValidate: true,
    }),
  ];

  it("should return 0 for a no input rule", () => {
    const rule = createSingleFilter();
    const result = countValidRules({
      filterFnList,
      dataSchema: mockDataSchema,
      rule,
    });
    expect(result).toBe(0);
  });

  it("should return 1 for a valid rule", () => {
    const rule = createSingleFilter({
      name: "Starts with",
      path: ["name"],
      args: ["test"],
    });
    const result = countValidRules({
      filterFnList,
      dataSchema: mockDataSchema,
      rule,
    });
    expect(result).toBe(1);
  });
});

describe("instantiateGenericFn", () => {
  it("should return undefined if genericLimit is not satisfied", () => {
    const schema = z.string(); // Example schema
    const genericFn: GenericFnSchema = defineGenericFn({
      name: "Test Function",
      genericLimit: (t): t is any => false, // Always returns false
      define: () => z.function({ input: [], output: z.unknown() }),
      implement: () => {},
    });

    const result = instantiateGenericFn(schema, genericFn);
    expect(result).toBeUndefined();
  });

  it("should return instantiated function if genericLimit is satisfied", () => {
    const schema = z.string(); // Example schema
    const genericFn = defineGenericFn({
      name: "Test Function",
      genericLimit: (t): t is any => true, // Always returns true
      define: (t) => z.function({ input: [t], output: z.boolean() }) as any,
      implement: (value) => !!value,
    });

    const result = instantiateGenericFn(schema, genericFn);
    expect(result).toBeDefined();
    expect(result?.name).toBe("Test Function");
    expect(result?.implement).toBeInstanceOf(Function);
    expect(
      isSameType(
        result!.define,
        z.function({ input: [schema], output: z.boolean() }),
      ),
    ).toBe(true);
  });

  it("should return undefined if instantiated function is not a filter", () => {
    const schema = z.string(); // Example schema
    const genericFn = defineGenericFn({
      name: "Non-Filter Function",
      genericLimit: (t): t is any => true,
      define: () => z.function(), // Not a filter
      implement: () => {},
    });

    const result = instantiateGenericFn(schema, genericFn);
    expect(result).toBeUndefined();
  });

  it("should keep meta information when instantiating a function", () => {
    const schema = z.string(); // Example schema
    const genericFn = defineGenericFn({
      name: "Test Function",
      genericLimit: (t): t is any => true,
      define: (t) => z.function({ input: [t], output: z.boolean() }) as any,
      implement: (value) => !!value,
      meta: { test: "test" },
    });

    const result = instantiateGenericFn(schema, genericFn);
    expect(result).toBeDefined();
    expect(result?.meta).toEqual({ test: "test", datatype: schema, genericFn });
  });
});
