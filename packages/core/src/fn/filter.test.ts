import { describe, expect, test } from "vitest";
import { z } from "zod";
import { createFilterSphere } from "../filter/index.js";
import { createFilterPredicate } from "../filter/predicate.js";
import {
  createSingleFilter,
  getFirstParameters,
  getParametersExceptFirst,
  isEqualPath,
} from "../filter/utils.js";
import { presetFilter } from "./filter.js";

describe("presetFilter", () => {
  const nullishFieldSchema = z.object({
    text: z.string().optional(),
    count: z.number().nullable(),
    createdAt: z.date().nullish(),
    enabled: z.boolean().optional(),
    status: z.enum(["draft", "published"]).nullable(),
    kind: z.union([z.literal("internal"), z.literal("external")]).optional(),
    tags: z.array(z.string()).nullable(),
  });

  test.each([
    {
      path: "text",
      expected: [
        "equals",
        "notEqual",
        "isEmpty",
        "isNotEmpty",
        "contains",
        "notContains",
        "startsWith",
        "endsWith",
      ],
    },
    {
      path: "count",
      expected: [
        "equals",
        "notEqual",
        "isEmpty",
        "isNotEmpty",
        "greaterThan",
        "greaterThanOrEqual",
        "lessThan",
        "lessThanOrEqual",
      ],
    },
    {
      path: "createdAt",
      expected: ["isEmpty", "isNotEmpty", "before", "after"],
    },
    {
      path: "enabled",
      expected: ["equals", "isEmpty", "isNotEmpty"],
    },
    {
      path: "status",
      expected: [
        "enumEquals",
        "enumNotEqual",
        "isEmpty",
        "isNotEmpty",
        "contains",
        "notContains",
        "startsWith",
        "endsWith",
      ],
    },
    {
      path: "kind",
      expected: [
        "equals",
        "notEqual",
        "isEmpty",
        "isNotEmpty",
        "contains",
        "notContains",
        "startsWith",
        "endsWith",
      ],
    },
    {
      path: "tags",
      expected: ["isEmpty", "isNotEmpty", "contains", "notContains"],
    },
  ])("exposes $path filters for a nullish field", ({ path, expected }) => {
    const field = createFilterSphere(nullishFieldSchema, presetFilter)
      .findFilterableField()
      .find((candidate) => isEqualPath(candidate.path, [path]));

    expect(field?.filterFnList.map((filter) => filter.name)).toEqual(expected);
  });

  test("declares nullish field inputs and non-nullish operands", () => {
    const fields = createFilterSphere(
      nullishFieldSchema,
      presetFilter,
    ).findFilterableField();

    for (const field of fields) {
      for (const filter of field.filterFnList) {
        const fieldParameter = getFirstParameters(filter);
        expect(
          z.safeParse(fieldParameter, null).success,
          `${field.path.join(".")}/${filter.name} should accept null`,
        ).toBe(true);
        expect(
          z.safeParse(fieldParameter, undefined).success,
          `${field.path.join(".")}/${filter.name} should accept undefined`,
        ).toBe(true);

        for (const operand of getParametersExceptFirst(filter)._zod.def.items) {
          expect(
            ["optional", "nullable"].includes(operand._zod.def.type),
            `${field.path.join(".")}/${filter.name} operand should be required`,
          ).toBe(false);
        }
      }
    }
  });

  test.each([
    {
      path: "enabled",
      name: "equals",
      args: [true],
      data: { enabled: undefined },
      expected: false,
    },
    {
      path: "text",
      name: "startsWith",
      args: ["a"],
      data: { text: undefined },
      expected: false,
    },
    {
      path: "text",
      name: "notEqual",
      args: ["a"],
      data: { text: null },
      expected: false,
    },
    {
      path: "text",
      name: "endsWith",
      args: ["a"],
      data: { text: null },
      expected: false,
    },
    {
      path: "text",
      name: "contains",
      args: ["a"],
      data: { text: undefined },
      expected: false,
    },
    {
      path: "count",
      name: "greaterThan",
      args: [-1],
      data: { count: undefined },
      expected: false,
    },
    {
      path: "count",
      name: "greaterThanOrEqual",
      args: [-1],
      data: { count: null },
      expected: false,
    },
    {
      path: "count",
      name: "lessThan",
      args: [1],
      data: { count: undefined },
      expected: false,
    },
    {
      path: "count",
      name: "lessThanOrEqual",
      args: [1],
      data: { count: null },
      expected: false,
    },
    {
      path: "createdAt",
      name: "before",
      args: [new Date("2026-01-01")],
      data: { createdAt: undefined },
      expected: false,
    },
    {
      path: "createdAt",
      name: "after",
      args: [new Date("2026-01-01")],
      data: { createdAt: null },
      expected: false,
    },
    {
      path: "status",
      name: "enumEquals",
      args: ["draft"],
      data: { status: undefined },
      expected: false,
    },
    {
      path: "status",
      name: "enumNotEqual",
      args: ["draft"],
      data: { status: null },
      expected: false,
    },
    {
      path: "tags",
      name: "notContains",
      args: ["archived"],
      data: { tags: null },
      expected: false,
    },
    {
      path: "text",
      name: "isEmpty",
      args: [],
      data: { text: undefined },
      expected: true,
    },
    {
      path: "text",
      name: "isNotEmpty",
      args: [],
      data: { text: null },
      expected: false,
    },
  ])(
    "$name treats a nullish $path value explicitly",
    ({ path, name, args, data, expected }) => {
      const schema = z.object({
        text: z.string().nullish(),
        count: z.number().nullish(),
        createdAt: z.date().nullish(),
        enabled: z.boolean().nullish(),
        status: z.enum(["draft", "published"]).nullish(),
        tags: z.array(z.string()).nullish(),
      });
      const predicate = createFilterPredicate({
        filterFnList: presetFilter,
        schema,
        filterRule: createSingleFilter({
          path: [path],
          name,
          args,
        }),
        fallbackValue: true,
        errorHandling: {
          catchError: true,
          logError: false,
        },
      });

      expect(predicate(data)).toBe(expected);
    },
  );
});
