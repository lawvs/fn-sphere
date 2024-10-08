# Filter Sphere

Filter Sphere is meant to generate advanced filters based on a zod schema. It is designed to work seamlessly with React, allowing you to create dynamic and complex filter interfaces in your applications.

## Installation

Install the package:

```sh
npm install @fn-sphere/filter

yarn add @fn-sphere/filter

pnpm add @fn-sphere/filter
```

Filter Sphere uses zod as its schema engine. You can install it by running:

```sh
npm install zod
```

## Usage

You can use the `useFilterSphere` hook to create a filter:

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
  const { rule, predicate, context } = useFilterSphere({
    schema: YOUR_DATA_SCHEMA,
  });
  const filteredData = YOUR_DATA.filter(predicate);
  console.log(filteredData);

  return (
    <FilterSphereProvider context={context}>
      <FilterBuilder />
    </FilterSphereProvider>
  );
};
```

## Custom Styles

You can provide custom styles for the filter styles by using the `FilterThemeProvider` component:

```tsx
import { FilterThemeProvider, FilterTheme } from "@fn-sphere/filter";

const theme: FilterTheme = {};

const App = () => {
  return (
    <FilterThemeProvider theme={theme}>
      <FlattenFilterDialog />
    </FilterThemeProvider>
  );
};
```
