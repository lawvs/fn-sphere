import { describe, expect, it } from "vitest";
import * as z from "zod";
import type { FilterPath } from "./types.js";
import { getSchemaAtPath, getValueAtPath } from "./utils.js";

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

    expect(getSchemaAtPath(schema, ["a", "b"] as FilterPath)).toBeInstanceOf(
      z.ZodString,
    );
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
