import { describe, expect, test } from "vitest";
import { z } from "zod";
import { defineTypedFn } from "../fn-helpers.js";
import { presetSort } from "./presets.js";
import { createSorterSphere } from "./sorter.js";
import type { SortRule } from "./types.js";

const zData = z.object({
  name: z.string(),
  age: z.number(),
});

type Data = z.infer<typeof zData>;

const numberCompare = defineTypedFn({
  name: "number compare",
  define: z.function({
    input: [z.number(), z.number()],
    output: z.number(),
  }),
  implement: (a, b) => a - b,
});

const stringCompare = defineTypedFn({
  name: "string compare",
  define: z.function({
    input: [z.string(), z.string()],
    output: z.number(),
  }),
  implement: (a, b) => a.localeCompare(b),
});

const testData: Data[] = [
  { name: "Charlie", age: 30 },
  { name: "Alice", age: 25 },
  { name: "Bob", age: 35 },
  { name: "Alice", age: 20 },
];

describe("createSorterSphere", () => {
  test("single field sort asc", () => {
    const sphere = createSorterSphere(zData, [numberCompare, stringCompare]);
    const fields = sphere.findSortableField();
    const ageField = fields.find((f) => f.path[0] === "age")!;
    const ageFn = ageField.sortFnList.find(
      (f) => f.name === "number compare",
    )!;

    const rule: SortRule = [sphere.getSortRule(ageField, ageFn, "asc")];
    const sorted = sphere.sortData(testData, rule);

    expect(sorted.map((d) => d.age)).toEqual([20, 25, 30, 35]);
  });

  test("single field sort desc", () => {
    const sphere = createSorterSphere(zData, [numberCompare, stringCompare]);
    const fields = sphere.findSortableField();
    const ageField = fields.find((f) => f.path[0] === "age")!;
    const ageFn = ageField.sortFnList.find(
      (f) => f.name === "number compare",
    )!;

    const rule: SortRule = [sphere.getSortRule(ageField, ageFn, "desc")];
    const sorted = sphere.sortData(testData, rule);

    expect(sorted.map((d) => d.age)).toEqual([35, 30, 25, 20]);
  });

  test("multi-field sort", () => {
    const sphere = createSorterSphere(zData, [numberCompare, stringCompare]);
    const fields = sphere.findSortableField();
    const nameField = fields.find((f) => f.path[0] === "name")!;
    const ageField = fields.find((f) => f.path[0] === "age")!;
    const nameFn = nameField.sortFnList.find(
      (f) => f.name === "string compare",
    )!;
    const ageFn = ageField.sortFnList.find(
      (f) => f.name === "number compare",
    )!;

    const rule: SortRule = [
      sphere.getSortRule(nameField, nameFn, "asc"),
      sphere.getSortRule(ageField, ageFn, "asc"),
    ];
    const sorted = sphere.sortData(testData, rule);

    expect(sorted).toEqual([
      { name: "Alice", age: 20 },
      { name: "Alice", age: 25 },
      { name: "Bob", age: 35 },
      { name: "Charlie", age: 30 },
    ]);
  });

  test("empty rule preserves order", () => {
    const sphere = createSorterSphere(zData, [numberCompare]);
    const sorted = sphere.sortData(testData, []);

    expect(sorted).toEqual(testData);
  });

  test("does not mutate input array", () => {
    const sphere = createSorterSphere(zData, [numberCompare]);
    const fields = sphere.findSortableField();
    const ageField = fields.find((f) => f.path[0] === "age")!;
    const ageFn = ageField.sortFnList.find(
      (f) => f.name === "number compare",
    )!;

    const original = [...testData];
    const rule: SortRule = [sphere.getSortRule(ageField, ageFn, "asc")];
    sphere.sortData(testData, rule);

    expect(testData).toEqual(original);
  });

  test("throws on duplicate names", () => {
    expect(() =>
      createSorterSphere(zData, [numberCompare, numberCompare]),
    ).toThrow("Duplicate sorter name: number compare");
  });

  test("throws on invalid fn (non-compare function)", () => {
    const booleanFn = defineTypedFn({
      name: "bad fn",
      define: z.function({
        input: [z.number()],
        output: z.boolean(),
      }),
      implement: (a) => a > 0,
    });
    expect(() => createSorterSphere(zData, [booleanFn])).toThrow(
      "Invalid sorter function: bad fn",
    );
  });

  test("throws on disallowed fn in getSortRule", () => {
    const sphere = createSorterSphere(zData, [numberCompare, stringCompare]);
    const fields = sphere.findSortableField();
    const nameField = fields.find((f) => f.path[0] === "name")!;

    // numberCompare is not in nameField's sortFnList
    expect(() => sphere.getSortRule(nameField, numberCompare)).toThrow(
      "Sort function is not allowed.",
    );
  });

  test("works with generic preset sort fns", () => {
    const sphere = createSorterSphere(zData, presetSort);
    const fields = sphere.findSortableField();

    // Both string and number fields should have the generic sort
    expect(fields.length).toBeGreaterThanOrEqual(2);

    const ageField = fields.find((f) => f.path[0] === "age")!;
    expect(ageField).toBeDefined();
    expect(ageField.sortFnList).toHaveLength(1);

    const ageFn = ageField.sortFnList[0]!;
    const rule: SortRule = [sphere.getSortRule(ageField, ageFn, "asc")];
    const sorted = sphere.sortData(testData, rule);

    expect(sorted.map((d) => d.age)).toEqual([20, 25, 30, 35]);
  });
});

describe("genericSort (presetSort)", () => {
  test("sorts numbers", () => {
    const schema = z.object({ val: z.number() });
    const sphere = createSorterSphere(schema, presetSort);
    const fields = sphere.findSortableField();
    const field = fields.find((f) => f.path[0] === "val")!;
    const fn = field.sortFnList[0]!;

    const data = [{ val: 3 }, { val: 1 }, { val: 2 }];
    const sorted = sphere.sortData(data, [
      sphere.getSortRule(field, fn, "asc"),
    ]);
    expect(sorted.map((d) => d.val)).toEqual([1, 2, 3]);

    const sortedDesc = sphere.sortData(data, [
      sphere.getSortRule(field, fn, "desc"),
    ]);
    expect(sortedDesc.map((d) => d.val)).toEqual([3, 2, 1]);
  });

  test("sorts strings", () => {
    const schema = z.object({ val: z.string() });
    const sphere = createSorterSphere(schema, presetSort);
    const fields = sphere.findSortableField();
    const field = fields.find((f) => f.path[0] === "val")!;
    const fn = field.sortFnList[0]!;

    const data = [{ val: "banana" }, { val: "apple" }, { val: "cherry" }];
    const sorted = sphere.sortData(data, [
      sphere.getSortRule(field, fn, "asc"),
    ]);
    expect(sorted.map((d) => d.val)).toEqual(["apple", "banana", "cherry"]);
  });

  test("sorts booleans (false < true)", () => {
    const schema = z.object({ val: z.boolean() });
    const sphere = createSorterSphere(schema, presetSort);
    const fields = sphere.findSortableField();
    const field = fields.find((f) => f.path[0] === "val")!;
    const fn = field.sortFnList[0]!;

    const data = [{ val: true }, { val: false }, { val: true }, { val: false }];
    const sorted = sphere.sortData(data, [
      sphere.getSortRule(field, fn, "asc"),
    ]);
    expect(sorted.map((d) => d.val)).toEqual([false, false, true, true]);
  });

  test("sorts dates", () => {
    const schema = z.object({ val: z.date() });
    const sphere = createSorterSphere(schema, presetSort);
    const fields = sphere.findSortableField();
    const field = fields.find((f) => f.path[0] === "val")!;
    const fn = field.sortFnList[0]!;

    const d1 = new Date("2024-01-01");
    const d2 = new Date("2023-06-15");
    const d3 = new Date("2025-03-20");
    const data = [{ val: d3 }, { val: d1 }, { val: d2 }];
    const sorted = sphere.sortData(data, [
      sphere.getSortRule(field, fn, "asc"),
    ]);
    expect(sorted.map((d) => d.val)).toEqual([d2, d1, d3]);
  });

  test("sorts enums", () => {
    const priority = z.enum(["low", "medium", "high"]);
    const schema = z.object({ val: priority });
    const sphere = createSorterSphere(schema, presetSort);
    const fields = sphere.findSortableField();
    const field = fields.find((f) => f.path[0] === "val")!;
    const fn = field.sortFnList[0]!;

    const data = [{ val: "medium" as const }, { val: "high" as const }, { val: "low" as const }];
    const sorted = sphere.sortData(data, [
      sphere.getSortRule(field, fn, "asc"),
    ]);
    expect(sorted.map((d) => d.val)).toEqual(["high", "low", "medium"]);
  });

  test("returns 0 for equal values", () => {
    const schema = z.object({ val: z.number() });
    const sphere = createSorterSphere(schema, presetSort);
    const fields = sphere.findSortableField();
    const field = fields.find((f) => f.path[0] === "val")!;
    const fn = field.sortFnList[0]!;

    const data = [{ val: 5 }, { val: 5 }, { val: 5 }];
    const sorted = sphere.sortData(data, [
      sphere.getSortRule(field, fn, "asc"),
    ]);
    expect(sorted.map((d) => d.val)).toEqual([5, 5, 5]);
  });

  test("does not match array fields", () => {
    const schema = z.object({
      tags: z.array(z.string()),
      name: z.string(),
    });
    const sphere = createSorterSphere(schema, presetSort);
    const fields = sphere.findSortableField();

    expect(fields.find((f) => f.path[0] === "tags")).toBeUndefined();
    expect(fields.find((f) => f.path[0] === "name")).toBeDefined();
  });

  test("multi-field sort with generic fns", () => {
    const schema = z.object({
      category: z.string(),
      score: z.number(),
    });
    const sphere = createSorterSphere(schema, presetSort);
    const fields = sphere.findSortableField();
    const catField = fields.find((f) => f.path[0] === "category")!;
    const scoreField = fields.find((f) => f.path[0] === "score")!;

    const data = [
      { category: "B", score: 10 },
      { category: "A", score: 20 },
      { category: "A", score: 10 },
      { category: "B", score: 20 },
    ];
    const sorted = sphere.sortData(data, [
      sphere.getSortRule(catField, catField.sortFnList[0]!, "asc"),
      sphere.getSortRule(scoreField, scoreField.sortFnList[0]!, "desc"),
    ]);
    expect(sorted).toEqual([
      { category: "A", score: 20 },
      { category: "A", score: 10 },
      { category: "B", score: 20 },
      { category: "B", score: 10 },
    ]);
  });
});
