# @fn-sphere/filter

This package provides a set of filters that can be used to filter data.

## Usage

Install the package:

```sh
npm add @fn-sphere/filter
```

Create a filter:

```tsx
import { createFilter } from "@fn-sphere/filter";
import { z } from "zod";

const YOUR_DATA_SCHEMA = z.object({
  name: z.string(),
  age: z.number(),
});
const YOUR_DATA: z.infer<typeof YOUR_DATA_SCHEMA>[] = [
  {
    name: "John",
    age: 30,
  },
];

const { getRule, openFilter } = createFilter({
  schema: YOUR_DATA_SCHEMA,
});

const initialRule = await getRule();

const { rule, predicate } = await openFilter();
console.log(rule);
const filteredData = YOUR_DATA.filter(predicate);
console.log(filteredData);
```
