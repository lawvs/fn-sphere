import { expect, test } from "vitest";
import { z } from "zod";
import { createFilterSphere } from "./filter/index.js";
import {
  createFilterGroup,
  getParametersExceptFirst,
  isEqualPath,
} from "./filter/utils.js";
import { defineTypedFn } from "./fn-sphere.js";

test("basic usage", () => {
  const zData = z.object({
    id: z.string(),
    name: z.string(),
    age: z
      .number()
      // limit will be ignored
      .min(0),
  });

  type Data = z.infer<typeof zData>;

  const filterSphere = createFilterSphere(zData, [
    defineTypedFn({
      name: "is admin",
      define: z.function({ input: [zData], output: z.boolean() }),
      implement: (value) => value.id === "admin",
    }),
    defineTypedFn({
      name: "number equal",
      define: z.function({
        input: [z.number(), z.number()],
        output: z.boolean(),
      }),
      implement: (value, target) => value === target,
    }),
  ]);

  const fields = filterSphere.findFilterableField();
  expect(fields).toHaveLength(2);
  expect(fields.map((i) => i.path)).toEqual([[], ["age"]]);

  const firstField = fields[0];
  if (!firstField) throw new Error("firstField is undefined");
  const availableFilter = firstField.filterFnList;
  expect(availableFilter).toHaveLength(1);

  const firstFilter = availableFilter[0];
  if (!firstFilter) throw new Error("firstFilter is undefined");
  expect(firstFilter.name).toEqual("is admin");
  const requiredParameters = getParametersExceptFirst(firstFilter);
  expect(requiredParameters._zod.def.items).toHaveLength(0);

  const data: Data[] = [
    {
      id: "admin",
      name: "name",
      age: 18,
    },
    {
      id: "other",
      name: "name",
      age: 18,
    },
  ];

  const rule = filterSphere.getFilterRule(firstField, firstFilter);

  const filterData = filterSphere.filterData(data, rule);

  expect(filterData).toHaveLength(1);
  expect(filterData[0]?.id).toEqual("admin");
});

test("filter nested obj", () => {
  const zData = z.object({
    name: z.string(),
    age: z.number(),
  });

  type Data = z.infer<typeof zData>;

  const filterSphere = createFilterSphere(zData, [
    defineTypedFn({
      name: "number equal",
      define: z.function({
        input: [z.number(), z.number()],
        output: z.boolean(),
      }),
      implement: (value, target) => value === target,
    }),
  ]);

  const fields = filterSphere.findFilterableField();
  expect(fields).toHaveLength(1);
  expect(fields.map((i) => i.path)).toEqual([["age"]]);

  const firstField = fields[0];
  if (!firstField) throw new Error("firstField is undefined");
  const availableFilter = firstField.filterFnList;
  expect(availableFilter).toHaveLength(1);

  const firstFilterSchema = availableFilter[0];
  if (!firstFilterSchema) throw new Error("firstFilterSchema is undefined");
  expect(firstFilterSchema.name).toEqual("number equal");
  const requiredParameters = getParametersExceptFirst(firstFilterSchema);
  expect(requiredParameters._zod.def.items).toHaveLength(1);

  const data: Data[] = [
    {
      name: "Alice",
      age: 18,
    },
    {
      name: "Bob",
      age: 19,
    },
  ];

  const rule = filterSphere.getFilterRule(firstField, firstFilterSchema, [19]);

  expect(rule.name).toEqual("number equal");

  const filterData = filterSphere.filterData(data, rule);

  expect(filterData).toHaveLength(1);
  expect(filterData[0]?.age).toEqual(19);
});

test("FilterGroup usage", () => {
  const zData = z.object({
    name: z.string(),
    age: z.number(),
  });

  type Data = z.infer<typeof zData>;

  const filterSphere = createFilterSphere(zData, [
    defineTypedFn({
      name: "number equal",
      define: z.function({
        input: [z.number(), z.number()],
        output: z.boolean(),
      }),
      implement: (value, target) => value === target,
    }),
    defineTypedFn({
      name: "string equal",
      define: z.function({
        input: [z.string(), z.string()],
        output: z.boolean(),
      }),
      implement: (value, target) => value === target,
    }),
  ]);

  const fields = filterSphere.findFilterableField();
  const ageField = fields.find((i) => isEqualPath(i.path, ["age"]))!;
  const nameField = fields.find((i) => isEqualPath(i.path, ["name"]))!;

  const ageFilter = ageField.filterFnList.find(
    (i) => i.name === "number equal",
  )!;
  const nameFilter = nameField.filterFnList.find(
    (i) => i.name === "string equal",
  )!;

  const filterGroup = createFilterGroup({
    op: "and",
    conditions: [
      filterSphere.getFilterRule(nameField, nameFilter, ["Alice"]),
      filterSphere.getFilterRule(ageField, ageFilter, [19]),
    ],
  });

  const data: Data[] = [
    {
      name: "Alice",
      age: 19,
    },
    {
      name: "Bob",
      age: 19,
    },
    {
      name: "Carol",
      age: 18,
    },
  ];

  const filterData = filterSphere.filterData(data, filterGroup);

  expect(filterData).toHaveLength(1);
  expect(filterData[0]?.name).toEqual("Alice");
  expect(filterData[0]?.age).toEqual(19);

  const orGroup = createFilterGroup({
    op: "or",
    conditions: [
      filterSphere.getFilterRule(nameField, nameFilter, ["Bob"]),
      filterSphere.getFilterRule(ageField, ageFilter, [18]),
    ],
  });
  const orFilterData = filterSphere.filterData(data, orGroup);

  expect(orFilterData).toHaveLength(2);
  expect(orFilterData[0]?.name).toEqual("Bob");
  expect(orFilterData[0]?.age).toEqual(19);
  expect(orFilterData[1]?.name).toEqual("Carol");
  expect(orFilterData[1]?.age).toEqual(18);
});
