# @fn-sphere/core

The `@fn-sphere/core` package is designed to provide a comprehensive set of utilities for working with data interactively. It offers tools for filtering, sorting, and transforming data, making it easier to handle complex data operations.

## Usages

### Filter

```ts
import {
  createFilterSphere,
  findFilterableFields,
  createFilterPredicate,
  presetFilter,
} from "@fn-sphere/core";
import { z } from "zod";

// Define data schema
const zData = z.object({
  name: z.string(),
  age: z.number(),
  address: z.object({
    city: z.string(),
    street: z.string(),
  }),
});

type Data = z.infer<typeof zData>;

// Get all filterable fields
const availableFields = findFilterableFields({
  schema,
  filterFnList,
  maxDeep,
});
console.log(availableFields);

const firstField = fields[0];
const availableFilter = firstField.filterFnList;
const firstFilterSchema = availableFilter[0];
console.log(firstFilterSchema);

const requiredParameters = getParametersExceptFirst(firstFilterSchema);
console.log(requiredParameters);

// Create a filter rule for specific field
const filterRule = createSingleFilter({
  name: firstFilterSchema.name,
  path: firstField.path,
  args: [INPUT_VALUE],
});

const predicate = createFilterPredicate({
  schema: zData,
  filterFnList: presetFilter,
  filterRule,
});

// Filter data
const filterData = data.filter(predicate);
console.log(filterData);
```

## API

- `createFilterSphere`: Creates a filter sphere with the given schema and filters.
- `findFilterableFields`: Finds the filterable fields in the given schema.
- `createFilterPredicate`: Creates a filter predicate with the given filter sphere and filter rule.
- `presetFilter`: A preset filter function that can be used to filter data.

## Types

```ts
// FilterSphere

const findFilterableFields: <Data>({
  schema,
  filterFnList,
  maxDeep,
}: {
  schema: $ZodType<Data>;
  filterFnList: FnSchema[];
  maxDeep?: number;
}) => FilterField[];

const createFilterPredicate: <Data>({
  schema,
  filterFnList,
  filterRule,
}: {
  /**
   * The schema of the data.
   */
  schema: $ZodType<Data>;
  filterFnList: FnSchema[];
  /**
   * The filter rule.
   */
  filterRule?: FilterRule;
}) => (data: Data) => boolean;

type FilterField = {
  /**
   * If it's a empty array, it means the root object
   */
  path: FilterPath;
  fieldSchema: $ZodType;
  filterFnList: StandardFnSchema[];
};

// Filter

interface SingleFilterInput {
  /**
   * Field path
   *
   * If it's a empty array, it means the root object.
   * If not provided, it means user didn't select a field.
   */
  path?: FilterPath;
  /**
   * Filter name
   *
   * If not provided, it means user didn't select a filter.
   */
  name?: string;
  /**
   * Arguments for the filter function
   */
  args: unknown[];
  invert?: boolean;
}

interface SingleFilter extends SingleFilterInput {
  type: "Filter";
  /**
   * Unique id, used for tracking changes or resorting
   */
  id: FilterId;
}

interface FilterGroupInput {
  op: "and" | "or";
  conditions: (SingleFilter | FilterGroup)[];
  invert?: boolean;
}

interface FilterGroup extends FilterGroupInput {
  type: "FilterGroup";
  /**
   * Unique id, used for tracking changes or resorting
   */
  id: FilterId;
}

type FilterRule = SingleFilter | FilterGroup;
```
