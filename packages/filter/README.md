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

## React

You can use the `useFilter` hook to manage the filter state:

```tsx
import { useFilter } from "@fn-sphere/filter";
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
  const { rule, predicate, openFilter } = useFilter({
    schema: YOUR_DATA_SCHEMA,
  });

  const handleOpenFilter = async () => {
    const { rule, predicate } = await openFilter();
    console.log(rule);
    const filteredData = YOUR_DATA.filter(predicate);
    console.log(filteredData);
  };

  return <button onClick={handleOpenFilter}>Open filter</button>;
};
```

## Custom filter styles

You can provide custom styles for the filter styles by using the `FilterThemeProvider` component:

```tsx
import {
  FlattenFilterDialog,
  FilterThemeProvider,
  FilterTheme,
} from "@fn-sphere/filter";

const theme: FilterTheme = {};

const App = () => {
  return (
    <FilterThemeProvider theme={theme}>
      <FlattenFilterDialog />
    </FilterThemeProvider>
  );
};
```
