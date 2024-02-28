import { expect, test } from "vitest";
import { createFilterSphere } from "./filter/index.js";
import { z } from "zod";

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

  const zPipeline = createFilterSphere(zData, [
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

  const fields = zPipeline.findFilterableField();
  expect(fields).toHaveLength(2);
  expect(fields.map((i) => i.path)).toEqual(["", "age"]);

  const firstField = fields[0];
  const availableFilter = firstField.filterList;
  expect(availableFilter).toHaveLength(1);

  const firstFilter = availableFilter[0];
  expect(firstFilter.schema.name).toEqual("is admin");
  const requiredParameters = firstFilter.requiredParameters;
  expect(requiredParameters.items).toHaveLength(0);

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

  const filterData = zPipeline.filterData(data, firstFilter);

  expect(filterData).toHaveLength(1);
  expect(filterData[0].id).toEqual("admin");
});

test("filter nested obj", () => {
  const zData = z.object({
    name: z.string(),
    age: z.number(),
  });

  type Data = z.infer<typeof zData>;

  const zPipeline = createFilterSphere(zData, [
    {
      name: "number equal",
      define: z.function().args(z.number(), z.number()).returns(z.boolean()),
      implement: (value, target) => value === target,
    },
  ]);

  const fields = zPipeline.findFilterableField();
  expect(fields).toHaveLength(1);
  expect(fields.map((i) => i.path)).toEqual(["age"]);

  const firstField = fields[0];
  const availableFilter = firstField.filterList;
  expect(availableFilter).toHaveLength(1);

  const firstFilter = availableFilter[0];
  expect(firstFilter.schema.name).toEqual("number equal");
  const requiredParameters = firstFilter.requiredParameters;
  expect(requiredParameters.items).toHaveLength(1);
  firstFilter.input(19);

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

  const filterData = zPipeline.filterData(data, firstFilter);

  expect(filterData).toHaveLength(1);
  expect(filterData[0].age).toEqual(19);
});

test("FilterGroup usage", () => {
  const zData = z.object({
    name: z.string(),
    age: z.number(),
  });

  type Data = z.infer<typeof zData>;

  const zPipeline = createFilterSphere(zData, [
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

  const fields = zPipeline.findFilterableField();
  const ageField = fields.find((i) => i.path === "age")!;
  const nameField = fields.find((i) => i.path === "name")!;

  const ageFilter = ageField.filterList.find(
    (i) => i.schema.name === "number equal",
  )!;
  const nameFilter = nameField.filterList.find(
    (i) => i.schema.name === "string equal",
  )!;

  ageFilter.input(19);
  nameFilter.input("Alice");

  const filterGroup = ageFilter.turnToGroup("and");
  filterGroup.conditions.push(nameFilter);

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

  const filterData = zPipeline.filterData(data, filterGroup);

  expect(filterData).toHaveLength(1);
  expect(filterData[0].name).toEqual("Alice");
  expect(filterData[0].age).toEqual(19);

  const orGroup = zPipeline.createFilterGroup("or", [ageFilter, nameFilter]);
  nameFilter.input("Bob");
  ageFilter.input(18);
  const orFilterData = zPipeline.filterData(data, orGroup);

  expect(orFilterData).toHaveLength(2);
  expect(orFilterData[0].name).toEqual("Bob");
  expect(orFilterData[0].age).toEqual(19);
  expect(orFilterData[1].name).toEqual("Carol");
  expect(orFilterData[1].age).toEqual(18);
});
