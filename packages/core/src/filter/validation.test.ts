import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineGenericFn, defineTypedFn } from "../fn-sphere.js";
import type { FnSchema } from "../types.js";
import type { FilterId, SingleFilter } from "./types.js";
import { isValidRule } from "./validation.js";

describe("isValidRule", () => {
  const filterFnList: FnSchema[] = [
    defineTypedFn({
      name: "Starts with",
      define: z.function().args(z.string(), z.string()).returns(z.boolean()),
      implement: (value, target) => value.startsWith(target),
      skipValidate: true,
    }),
    defineTypedFn({
      name: "Is checked",
      define: z.function().args(z.boolean()).returns(z.boolean()),
      implement: (value) => value === true,
      skipValidate: true,
    }),
  ];

  const mockDataSchema = z.object({
    name: z.string(),
    boolean: z.boolean(),
  });

  it("should return false for a no input rule", () => {
    const rule: SingleFilter = {
      id: "1" as FilterId,
      type: "Filter",
      name: "Starts with",
      path: ["name"],
      args: [],
    };

    const result = isValidRule({
      filterFnList: filterFnList,
      dataSchema: mockDataSchema,
      rule,
    });

    expect(result).toBe(false);
  });

  it("should return false for a no path rule", () => {
    const rule: SingleFilter = {
      id: "1" as FilterId,
      type: "Filter",
      name: "Starts with",
      args: [],
    };

    const result = isValidRule({
      filterFnList: filterFnList,
      dataSchema: mockDataSchema,
      rule,
    });

    expect(result).toBe(false);
  });

  it("should return false for a error path rule", () => {
    const rule: SingleFilter = {
      id: "1" as FilterId,
      type: "Filter",
      name: "Starts with",
      path: ["boolean"],
      args: [],
    };

    const result = isValidRule({
      filterFnList: filterFnList,
      dataSchema: mockDataSchema,
      rule,
    });

    expect(result).toBe(false);
  });

  it("should return false for a error name rule", () => {
    const rule: SingleFilter = {
      id: "1" as FilterId,
      type: "Filter",
      name: "no this filter",
      path: ["name"],
      args: ["data"],
    };

    const result = isValidRule({
      filterFnList: filterFnList,
      dataSchema: mockDataSchema,
      rule,
    });

    expect(result).toBe(false);
  });

  it("should return true for a string rule", () => {
    const rule: SingleFilter = {
      id: "1" as FilterId,
      type: "Filter",
      name: "Starts with",
      path: ["name"],
      args: ["data"],
    };

    const result = isValidRule({
      filterFnList: filterFnList,
      dataSchema: mockDataSchema,
      rule,
    });

    expect(result).toBe(true);
  });

  it("should return true for a boolean rule", () => {
    const rule: SingleFilter = {
      id: "1" as FilterId,
      type: "Filter",
      name: "Is checked",
      path: ["boolean"],
      args: [],
    };

    const result = isValidRule({
      filterFnList: filterFnList,
      dataSchema: mockDataSchema,
      rule,
    });

    expect(result).toBe(true);
  });

  it("should return false when no input for skip validate standard fn", () => {
    const rule: SingleFilter = {
      id: "1" as FilterId,
      type: "Filter",
      name: "Equals",
      path: ["name"],
      args: [],
    };

    const standardFn = defineTypedFn({
      name: "Equals",
      define: z.function().args(z.string(), z.string()).returns(z.boolean()),
      implement: (value, target) => value === target,
      skipValidate: true,
    });

    const result = isValidRule({
      filterFnList: [standardFn],
      dataSchema: mockDataSchema,
      rule,
    });

    expect(result).toBe(false);

    rule.args = ["data"];
    const newResult = isValidRule({
      filterFnList: [standardFn],
      dataSchema: mockDataSchema,
      rule,
    });
    expect(newResult).toBe(true);
  });

  it("should return false when no input for skip validate generic fn", () => {
    const rule: SingleFilter = {
      id: "1" as FilterId,
      type: "Filter",
      name: "Equals",
      path: ["name"],
      args: [],
    };

    const genericFn = defineGenericFn({
      name: "Equals",
      genericLimit: (t): t is z.ZodString | z.ZodNumber => true,
      define: (t) => z.function().args(t, t).returns(z.boolean()),
      implement: (value: z.Primitive, target: z.Primitive) => value === target,
      skipValidate: true,
    });

    const result = isValidRule({
      filterFnList: [genericFn],
      dataSchema: mockDataSchema,
      rule,
    });

    expect(result).toBe(false);

    rule.args = ["data"];
    const newResult = isValidRule({
      filterFnList: [genericFn],
      dataSchema: mockDataSchema,
      rule,
    });
    expect(newResult).toBe(true);
  });
});
