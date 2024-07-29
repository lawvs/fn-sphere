import { expect, test } from "vitest";
import { z } from "zod";
import { createFilterSphere } from "./filter/index.js";
import type { FilterGroup } from "./filter/types.js";
import {
  genFilterId,
  getParametersExceptFirst,
  isEqualPath,
} from "./filter/utils.js";

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
    {
      name: "is admin",
      define: z.function().args(zData).returns(z.boolean()),
      implement: (value) => value.id === "admin",
    },
    {
      name: "number equal",
      define: z.function().args(z.number(), z.number()).returns(z.boolean()),
      implement: (value, target) => value === target,
    },
  ]);

  const fields = filterSphere.findFilterableField();
  expect(fields).toHaveLength(2);
  expect(fields.map((i) => i.path)).toEqual([[], ["age"]]);

  const firstField = fields[0];
  const availableFilter = firstField.filterList;
  expect(availableFilter).toHaveLength(1);

  const firstFilter = availableFilter[0];
  expect(firstFilter.name).toEqual("is admin");
  const requiredParameters = getParametersExceptFirst(firstFilter);
  expect(requiredParameters).toHaveLength(0);

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

  const filterData = filterSphere.filterData(data, {
    id: genFilterId(),
    type: "Filter",
    path: firstField.path,
    name: firstFilter.name,
    args: [],
  });

  expect(filterData).toHaveLength(1);
  expect(filterData[0].id).toEqual("admin");
});

test("filter nested obj", () => {
  const zData = z.object({
    name: z.string(),
    age: z.number(),
  });

  type Data = z.infer<typeof zData>;

  const filterSphere = createFilterSphere(zData, [
    {
      name: "number equal",
      define: z.function().args(z.number(), z.number()).returns(z.boolean()),
      implement: (value, target) => value === target,
    },
  ]);

  const fields = filterSphere.findFilterableField();
  expect(fields).toHaveLength(1);
  expect(fields.map((i) => i.path)).toEqual([["age"]]);

  const firstField = fields[0];
  const availableFilter = firstField.filterList;
  expect(availableFilter).toHaveLength(1);

  const firstFilterSchema = availableFilter[0];
  expect(firstFilterSchema.name).toEqual("number equal");
  const requiredParameters = getParametersExceptFirst(firstFilterSchema);
  expect(requiredParameters).toHaveLength(1);

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
  const rule = {
    id: genFilterId(),
    type: "Filter" as const,
    name: firstFilterSchema.name,
    path: firstField.path,
    args: [19],
  };
  expect(rule.name).toEqual("number equal");

  const filterData = filterSphere.filterData(data, rule);

  expect(filterData).toHaveLength(1);
  expect(filterData[0].age).toEqual(19);
});

test("FilterGroup usage", () => {
  const zData = z.object({
    name: z.string(),
    age: z.number(),
  });

  type Data = z.infer<typeof zData>;

  const filterSphere = createFilterSphere(zData, [
    {
      name: "number equal",
      define: z.function().args(z.number(), z.number()).returns(z.boolean()),
      implement: (value, target) => value === target,
    },
    {
      name: "string equal",
      define: z.function().args(z.string(), z.string()).returns(z.boolean()),
      implement: (value, target) => value === target,
    },
  ]);

  const fields = filterSphere.findFilterableField();
  const ageField = fields.find((i) => isEqualPath(i.path, ["age"]))!;
  const nameField = fields.find((i) => isEqualPath(i.path, ["name"]))!;

  const ageFilter = ageField.filterList.find((i) => i.name === "number equal")!;
  const nameFilter = nameField.filterList.find(
    (i) => i.name === "string equal",
  )!;

  const filterGroup: FilterGroup = {
    id: genFilterId(),
    type: "FilterGroup" as const,
    op: "and" as const,
    conditions: [
      {
        id: genFilterId(),
        type: "Filter" as const,
        name: nameFilter.name,
        path: nameField.path,
        args: ["Alice"],
      },
      {
        id: genFilterId(),
        type: "Filter" as const,
        name: ageFilter.name,
        path: ageField.path,
        args: [19],
      },
    ],
  };

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
  expect(filterData[0].name).toEqual("Alice");
  expect(filterData[0].age).toEqual(19);

  const orGroup: FilterGroup = {
    id: genFilterId(),
    type: "FilterGroup" as const,
    op: "or" as const,
    conditions: [
      {
        id: genFilterId(),
        type: "Filter" as const,
        name: nameFilter.name,
        path: nameField.path,
        args: ["Bob"],
      },
      {
        id: genFilterId(),
        type: "Filter" as const,
        name: ageFilter.name,
        path: ageField.path,
        args: [18],
      },
    ],
  };
  const orFilterData = filterSphere.filterData(data, orGroup);

  expect(orFilterData).toHaveLength(2);
  expect(orFilterData[0].name).toEqual("Bob");
  expect(orFilterData[0].age).toEqual(19);
  expect(orFilterData[1].name).toEqual("Carol");
  expect(orFilterData[1].age).toEqual(18);
});
