import { describe, expect, test } from "vitest";
import { logicFns as publicLogicFns } from "../index.js";
import { logicFns } from "./logic.js";

const getLogicFn = (name: string) => {
  const fnSchema = logicFns.find((fn) => fn.name === name);
  if (!fnSchema) {
    throw new Error(`Unknown logic function: ${name}`);
  }
  return fnSchema.define.implement(fnSchema.implement) as (
    ...values: boolean[]
  ) => boolean;
};

describe("logicFns", () => {
  test("is exported from the package entrypoint", () => {
    expect(publicLogicFns).toBe(logicFns);
  });

  describe("and", () => {
    test.each([
      [true, true, true],
      [true, false, false],
      [false, true, false],
      [false, false, false],
    ] as const)("and(%s, %s) returns %s", (a, b, expected) => {
      expect(getLogicFn("and")(a, b)).toBe(expected);
    });
  });

  describe("or", () => {
    test.each([
      [true, true, true],
      [true, false, true],
      [false, true, true],
      [false, false, false],
    ] as const)("or(%s, %s) returns %s", (a, b, expected) => {
      expect(getLogicFn("or")(a, b)).toBe(expected);
    });
  });

  describe("not", () => {
    test.each([
      [true, false],
      [false, true],
    ] as const)("not(%s) returns %s", (value, expected) => {
      expect(getLogicFn("not")(value)).toBe(expected);
    });
  });
});
