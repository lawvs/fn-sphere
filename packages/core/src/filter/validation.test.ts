import { describe, expect, it } from "vitest";
import { z } from "zod";
import { booleanFilter, stringFilter } from "../presets.js";
import type { FnSchema } from "../types.js";
import type { FilterId, SingleFilter } from "./types.js";
import { isValidRule } from "./validation.js";

describe("isValidRule", () => {
  const filterList: FnSchema[] = [...booleanFilter, ...stringFilter];

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
      filterList: filterList,
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
      path: undefined,
      args: [],
    };

    const result = isValidRule({
      filterList: filterList,
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
      filterList: filterList,
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
      filterList: filterList,
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
      filterList: filterList,
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
      filterList: filterList,
      dataSchema: mockDataSchema,
      rule,
    });

    expect(result).toBe(true);
  });
});
