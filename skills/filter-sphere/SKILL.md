---
name: filter-sphere
description: Integrate or customize Filter Sphere for Zod-typed data. Use for React filter UIs, themes, localization, custom filter functions, and filtering or sorting with @fn-sphere/core.
---

# Filter Sphere

## Choose the relevant guide

Before implementing a change, read the guides for that task. Follow only the relevant rows.

In the fn-sphere repository, read the local documentation first. Map each URL below to `packages/docs/src/content/docs/`: replace `/fn-sphere/` with that directory and the trailing slash with `.mdx`. For example, `/fn-sphere/customization/theme/` maps to `packages/docs/src/content/docs/customization/theme.mdx`.

In other projects, use the linked documentation and check APIs against the installed package types.

| Task                                            | Read                                                                                                                                                                  |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add a filter UI or edit an example              | [Getting Started](https://www.waterwater.moe/fn-sphere/guides/getting-started/), [Best Practices](https://www.waterwater.moe/fn-sphere/guides/best-practices/)        |
| Change controls or rule layouts                 | [Theme](https://www.waterwater.moe/fn-sphere/customization/theme/)                                                                                                    |
| Translate labels or compose localized sentences | [Localization](https://www.waterwater.moe/fn-sphere/customization/localization/)                                                                                      |
| Read application metadata from field schemas    | [Schema Metadata](https://www.waterwater.moe/fn-sphere/customization/schema-metadata/)                                                                                |
| Change how parameter schemas map to inputs      | [Data Input](https://www.waterwater.moe/fn-sphere/customization/data-input/)                                                                                          |
| Add filtering behavior                          | [Customizing Filters](https://www.waterwater.moe/fn-sphere/customization/filter/), [Preset Filters](https://www.waterwater.moe/fn-sphere/reference/presets/)          |
| Save or restore rules                           | [Persistence](https://www.waterwater.moe/fn-sphere/customization/persistence/)                                                                                        |
| Sort data or add compare functions              | [Sort Getting Started](https://www.waterwater.moe/fn-sphere/sort/getting-started/), [Custom Sort Functions](https://www.waterwater.moe/fn-sphere/sort/customization/) |

For working UI compositions, consult [Example](https://www.waterwater.moe/fn-sphere/reference/example/).

## React setup

If the project does not have the React filter package, install it with Zod:

```bash
pnpm add @fn-sphere/filter zod
```

```tsx
import {
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
} from "@fn-sphere/filter";
import { z } from "zod";

const schema = z.object({
  id: z.number(),
  name: z.string(),
  age: z.number(),
});

const data = [
  { id: 1, name: "Alice", age: 25 },
  { id: 2, name: "Bob", age: 30 },
];

export function MyFilter() {
  const { context, predicate } = useFilterSphere<z.infer<typeof schema>>({
    schema,
  });
  const filteredData = data.filter(predicate);

  return (
    <FilterSphereProvider context={context}>
      <FilterBuilder />
      <ul>
        {filteredData.map((row) => (
          <li key={row.id}>
            {row.name}: {row.age}
          </li>
        ))}
      </ul>
    </FilterSphereProvider>
  );
}
```

## Implementation choices

- Start with the preset functions and schema-based matching. Set `filterFnList` for custom behavior or an explicit product restriction.
- Use `createFilterTheme` to retain defaults. Choose `components` for controls, `templates` for rule layouts, `dataInputViews` for parameter adaptation, and `primitives` for base elements.
- When composing templates, obtain child templates through `useView("templates")`. This keeps nested rules responsive to theme overrides.
- Use the options and setters from `useFilterSelect` for field and operator selection. Built-in input adapters handle option values, labels, and rule arguments.
- Configure `getLocaleText` at the integration entry point. Inside the provider, use `useRootRule()` to access it. Keep sentence interpolation separate from translation lookup.
- Use default field paths and literal values as translation keys when they fit. Add `.describe()` for different labels or translation keys.

Keep the integration entry point focused on schema configuration, the provider, the builder, and data consumption. Read Best Practices for module boundaries and example design.
