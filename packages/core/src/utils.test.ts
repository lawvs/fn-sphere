import { describe, expect, it } from "vitest";
import * as z from "zod";
import { getSchemaAtPath, getValueAtPath } from "./utils.js";

describe("getValueFromPath", () => {
  it("should return the correct value for a given path", () => {
    const obj = {
      selector: { to: { val: "val" } },
      target: [1, 2, { a: "test" }],
    };

    expect(getValueAtPath(obj, ["selector", "to", "val"])).toBe("val");
    expect(getValueAtPath(obj, ["target", 2, "a"])).toBe("test");
  });

  it("should return undefined if the path does not exist", () => {
    const obj = { a: { b: { c: "value" } } };

    expect(getValueAtPath(obj, ["a", "b", "d"])).toBeUndefined();
    expect(getValueAtPath(obj, ["a", "c", "d"])).toBeUndefined();
  });

  it("should return the whole object if no path is provided", () => {
    const obj = { a: 1, b: 2 };

    expect(getValueAtPath(obj, [])).toEqual(obj);
  });
});

describe("getSchemaFromPath", () => {
  it("should return the correct schema for a given path", () => {
    const schema = z.object({
      a: z.object({
        b: z.string(),
      }),
    });

    expect(getSchemaAtPath(schema, ["a", "b"])).toBeInstanceOf(z.ZodString);
  });

  it("should return undefined if the path does not exist", () => {
    const schema = z.object({
      a: z.object({
        b: z.string(),
      }),
    });

    expect(getSchemaAtPath(schema, ["a", "c"])).toBeUndefined();
  });

  it("should return the whole schema if no path is provided", () => {
    const schema = z.object({
      a: z.object({
        b: z.string(),
      }),
    });

    expect(getSchemaAtPath(schema, [])).toEqual(schema);
  });
});
