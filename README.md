# Fn Sphere

[![Build](https://github.com/lawvs/fn-sphere/actions/workflows/build.yml/badge.svg)](https://github.com/lawvs/fn-sphere/actions/workflows/build.yml)
[![npm](https://img.shields.io/npm/v/@fn-sphere/filter)](https://www.npmjs.com/package/@fn-sphere/filter)

Fn Sphere contains a set of libraries for filtering, sorting, and transforming data. Use it, you can easily integrate advanced filters, sorters, and transform functions to handle your data.

## Filter Sphere

With Filter Sphere, you can easily integrate a filter system into your application.

![demo](https://github.com/user-attachments/assets/5a5b9ebe-f37e-4944-8bf2-e29555dff138)

![demo ui](https://github.com/user-attachments/assets/cbf689fd-029d-4f2b-8993-0363f2667e74)

## Usage

Visit [Filter Sphere Docs](https://lawvs.github.io/fn-sphere) to learn more.

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
  { name: "Jack", age: 18 },
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

- This project is inspired by the filter system in [toeverything/AFFiNE](https://github.com/toeverything/AFFiNE/tree/3e810eb043e62811ba3ab2e021c6f4b92fb4fe70/packages/frontend/core/src/components/page-list/filter)
