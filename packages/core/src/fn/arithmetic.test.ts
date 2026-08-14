import { describe, expect, test } from "vitest";
import { arithmeticFns as publicArithmeticFns } from "../index.js";
import { arithmeticFns } from "./arithmetic.js";

const getArithmeticFn = (name: string) => {
  const fnSchema = arithmeticFns.find((fn) => fn.name === name);
  if (!fnSchema) {
    throw new Error(`Unknown arithmetic function: ${name}`);
  }
  return fnSchema.define.implement(fnSchema.implement) as (
    left: number,
    right: number,
  ) => number;
};

describe("arithmeticFns", () => {
  test("is exported from the package entrypoint", () => {
    expect(publicArithmeticFns).toBe(arithmeticFns);
  });

  test.each([
    ["add", 2, 3, 5],
    ["add", -1.5, 0.5, -1],
    ["subtract", 10, 4, 6],
    ["multiply", -2, 3, -6],
    ["divide", 7.5, 2.5, 3],
  ] as const)("%s(%s, %s) returns %s", (name, left, right, expected) => {
    expect(getArithmeticFn(name)(left, right)).toBe(expected);
  });

  test.each([0, -0])("divide rejects a zero divisor", (divisor) => {
    expect(() => getArithmeticFn("divide")(1, divisor)).toThrowError(
      new RangeError("Division by zero"),
    );
  });
});
