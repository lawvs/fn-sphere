# @fn-sphere/core

`@fn-sphere/core` is a library that provides a set of utilities to work with data interactively. It provides a set of tools for filtering, sorting, and transforming data.

## Usages

### Filter

```ts
import { createFilter, commonFilters } from "@fn-sphere/core";
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

// Create a filter sphere
const filterSphere = createFilter(zData, [...commonFilters]);
// Get filterable fields
const availableField = filterSphere.findFilterableField();
console.log(availableField);

const firstField = fields[0];
const availableFilter = firstField.filterList;
const firstFilter = availableFilter[0];
console.log(firstFilter);

const requiredArgs = firstFilter.requiredParameters();
console.log(requiredArgs);
// Input missing required parameters
firstFilter.input(25);
const filterData = filterSphere.filterData(data, firstFilter);
console.log(filterData);
```
