# 🚧 Fn Sphere 🚧

[![Build](https://github.com/lawvs/fn-sphere/actions/workflows/build.yml/badge.svg)](https://github.com/lawvs/fn-sphere/actions/workflows/build.yml)

## Overview

Fn Sphere is a library for filtering, sorting, and transforming data. Use it, you can easily integrate advanced filters, sorters, and transform functions to handle your data.

## Usage

Install the filter package:

```sh
npm add @fn-sphere/filter
```

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

// Create a filter with the schema
const { getRule, openFilter } = createFilter({
  schema: YOUR_DATA_SCHEMA,
});

const { rule, predicate } = await openFilter();
console.log(rule);
const filteredData = YOUR_DATA.filter(predicate);
console.log(filteredData);
```

## Acknowledgements

- Inspired by [filter in toeverything/blocksuite](https://github.com/toeverything/blocksuite/tree/12b675d/packages/blocks/src/database-block/logical) and [zzj-table-demo](https://github.com/zzj3720/table-demo)
