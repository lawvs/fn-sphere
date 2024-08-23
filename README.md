# 🚧 Fn Sphere 🚧

[![Build](https://github.com/lawvs/fn-sphere/actions/workflows/build.yml/badge.svg)](https://github.com/lawvs/fn-sphere/actions/workflows/build.yml)
[![npm](https://img.shields.io/npm/v/@fn-sphere/filter)](https://www.npmjs.com/package/@fn-sphere/filter)

## Overview

Fn Sphere is a library for filtering, sorting, and transforming data. Use it, you can easily integrate advanced filters, sorters, and transform functions to handle your data.

## Usage

Install the filter package:

```sh
npm add @fn-sphere/filter
```

```tsx
import { useFilterSphere } from "@fn-sphere/filter";
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

const Filter = () => {
  const { filterRule, predicate, context } = useFilterSphere({
    schema: YOUR_DATA_SCHEMA,
    onRuleChange: ({ predicate }) => {
      const filteredData = YOUR_DATA.filter(predicate);
      console.log(filteredData);
    },
  });

  return (
    <FilterSphereProvider context={context}>
      <FilterBuilder />
    </FilterSphereProvider>
  );
};
```

## Acknowledgements

- Inspired by [filter in toeverything/blocksuite](https://github.com/toeverything/blocksuite/tree/12b675d/packages/blocks/src/database-block/logical) and [zzj-table-demo](https://github.com/zzj3720/table-demo)
