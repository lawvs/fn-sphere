import { describe, expect, test, vi } from "vitest";
import { z } from "zod";
import type { $ZodString } from "zod/v4/core";
import { defineGenericFn, defineTypedFn } from "../fn-helpers.js";
import { createFilterPredicate } from "./predicate.js";
import type { FilterRule } from "./types.js";
import { createSingleFilter } from "./utils.js";

describe("createFilterPredicate", () => {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
  });

  type Data = z.infer<typeof schema>;

  const filterFnList = [
    defineTypedFn({
      name: "equals",
      define: z.function({
        input: [z.string(), z.string()],
        output: z.boolean(),
      }),
      implement: (value, target) => value === target,
    }),
  ];

  test("uses default error handling (catch errors, log, return fallbackValue)", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const errorFn = defineTypedFn({
      name: "error filter",
      define: z.function({
        input: [z.string()],
        output: z.boolean(),
      }),
      implement: () => {
        throw new Error("Test error");
      },
    });

    const rule = createSingleFilter({
      path: ["name"],
      name: "error filter",
      args: [],
    });

    const predicate = createFilterPredicate({
      filterFnList: [errorFn],
      schema,
      filterRule: rule,
    });

    const data: Data = { name: "Alice", age: 30 };
    const result = predicate(data);

    expect(result).toBe(true); // default fallbackValue
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Filter predicate error:",
      rule,
      data,
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  test("returns fallbackValue on error when catchError is true", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const errorFn = defineTypedFn({
      name: "error filter",
      define: z.function({
        input: [z.string()],
        output: z.boolean(),
      }),
      implement: () => {
        throw new Error("Test error");
      },
    });

    const rule = createSingleFilter({
      path: ["name"],
      name: "error filter",
      args: [],
    });

    const predicate = createFilterPredicate({
      filterFnList: [errorFn],
      schema,
      filterRule: rule,
      fallbackValue: false,
      errorHandling: { catchError: true, logError: false },
    });

    const result = predicate({ name: "Alice", age: 30 });

    expect(result).toBe(false);
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test("throws error when catchError is false", () => {
    const errorFn = defineTypedFn({
      name: "error filter",
      define: z.function({
        input: [z.string()],
        output: z.boolean(),
      }),
      implement: () => {
        throw new Error("Test error");
      },
    });

    const rule = createSingleFilter({
      path: ["name"],
      name: "error filter",
      args: [],
    });

    const predicate = createFilterPredicate({
      filterFnList: [errorFn],
      schema,
      filterRule: rule,
      errorHandling: { catchError: false, logError: false },
    });

    expect(() => predicate({ name: "Alice", age: 30 })).toThrow("Test error");
  });

  test("logs error when logError is true", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const errorFn = defineTypedFn({
      name: "error filter",
      define: z.function({
        input: [z.string()],
        output: z.boolean(),
      }),
      implement: () => {
        throw new Error("Test error");
      },
    });

    const rule = createSingleFilter({
      path: ["name"],
      name: "error filter",
      args: [],
    });

    const predicate = createFilterPredicate({
      filterFnList: [errorFn],
      schema,
      filterRule: rule,
      fallbackValue: true,
      errorHandling: { catchError: true, logError: true },
    });

    predicate({ name: "Alice", age: 30 });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Filter predicate error:",
      rule,
      { name: "Alice", age: 30 },
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  test("does not log error when logError is false", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const errorFn = defineTypedFn({
      name: "error filter",
      define: z.function({
        input: [z.string()],
        output: z.boolean(),
      }),
      implement: () => {
        throw new Error("Test error");
      },
    });

    const rule = createSingleFilter({
      path: ["name"],
      name: "error filter",
      args: [],
    });

    const predicate = createFilterPredicate({
      filterFnList: [errorFn],
      schema,
      filterRule: rule,
      fallbackValue: true,
      errorHandling: { catchError: true, logError: false },
    });

    predicate({ name: "Alice", age: 30 });

    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test("works correctly when no error occurs", () => {
    const rule = createSingleFilter({
      path: ["name"],
      name: "equals",
      args: ["Alice"],
    });

    const predicate = createFilterPredicate({
      filterFnList,
      schema,
      filterRule: rule,
      fallbackValue: false,
      errorHandling: { catchError: true, logError: true },
    });

    expect(predicate({ name: "Alice", age: 30 })).toBe(true);
    expect(predicate({ name: "Bob", age: 25 })).toBe(false);
  });

  test("returns fallbackValue when filterRule is undefined", () => {
    const predicateTrue = createFilterPredicate({
      filterFnList,
      schema,
      filterRule: undefined as unknown as FilterRule,
      fallbackValue: true,
    });

    const predicateFalse = createFilterPredicate({
      filterFnList,
      schema,
      filterRule: undefined as unknown as FilterRule,
      fallbackValue: false,
    });

    expect(predicateTrue({ name: "Alice", age: 30 })).toBe(true);
    expect(predicateFalse({ name: "Alice", age: 30 })).toBe(false);
  });

  test("does not call a strict custom filter for a nullish field", () => {
    const optionalSchema = z.object({
      name: z.string().optional(),
    });
    const strictImplementation = vi.fn((value: string, target: string) =>
      value.startsWith(target),
    );
    const strictFilter = defineTypedFn({
      name: "strict starts with",
      define: z.function({
        input: [z.string(), z.string()],
        output: z.boolean(),
      }),
      implement: strictImplementation,
    });
    const predicate = createFilterPredicate({
      filterFnList: [strictFilter],
      schema: optionalSchema,
      filterRule: createSingleFilter({
        path: ["name"],
        name: "strict starts with",
        args: ["A"],
      }),
      fallbackValue: false,
      errorHandling: {
        catchError: false,
        logError: false,
      },
    });

    expect(predicate({ name: undefined })).toBe(false);
    expect(strictImplementation).not.toHaveBeenCalled();
  });

  test.each([
    {
      name: "any",
      fieldSchema: z.any(),
      value: null,
    },
    {
      name: "union containing any",
      fieldSchema: z.union([z.string(), z.any()]),
      value: 42,
    },
  ])(
    "does not call a strict custom filter for an $name field",
    ({ fieldSchema, value }) => {
      const strictImplementation = vi.fn(
        (fieldValue: string, target: string) => fieldValue === target,
      );
      const strictFilter = defineTypedFn({
        name: "strict equals",
        define: z.function({
          input: [z.string(), z.string()],
          output: z.boolean(),
        }),
        implement: strictImplementation,
        skipValidate: true,
      });
      const predicate = createFilterPredicate({
        filterFnList: [strictFilter],
        schema: z.object({ value: fieldSchema }),
        filterRule: createSingleFilter({
          path: ["value"],
          name: "strict equals",
          args: ["Alice"],
        }),
        fallbackValue: false,
        errorHandling: {
          catchError: false,
          logError: false,
        },
      });

      expect(predicate({ value })).toBe(false);
      expect(strictImplementation).not.toHaveBeenCalled();
    },
  );

  test("does not call a strict custom generic filter for a nullish field", () => {
    const strictImplementation = vi.fn(
      (value: string, target: string) => value === target,
    );
    const strictGenericFilter = defineGenericFn({
      name: "strict generic equals",
      genericLimit: (datatype): datatype is $ZodString =>
        datatype._zod.def.type === "string",
      define: (datatype) =>
        z.function({
          input: [datatype, datatype],
          output: z.boolean(),
        }),
      implement: strictImplementation,
      skipValidate: true,
    });
    const predicate = createFilterPredicate({
      filterFnList: [strictGenericFilter],
      schema: z.object({ value: z.string().optional() }),
      filterRule: createSingleFilter({
        path: ["value"],
        name: "strict generic equals",
        args: ["Alice"],
      }),
      fallbackValue: false,
      errorHandling: {
        catchError: false,
        logError: false,
      },
    });

    expect(predicate({ value: undefined })).toBe(false);
    expect(strictImplementation).not.toHaveBeenCalled();
  });
});
