---
name: filter-sphere
description: Integrate Filter Sphere into applications and libraries. Use for React filter UIs, reusable filter components, themes, localization, custom filter functions, and filtering or sorting with @fn-sphere/core.
---

# Filter Sphere

Help developers use Filter Sphere in their own applications and libraries. Adapt the integration to the host project's schemas, components, state ownership, and translation system.

## Choose the integration

- Use `@fn-sphere/filter` for React filtering interfaces. It provides the hooks, provider, builder, and theme extension points.
- Use `@fn-sphere/core` for filtering or sorting without React. Use `createFilterPredicate` or `createFilterSphere` for filtering, and `createSorterSphere` for sorting.
- Check the host project's installed versions and package types before choosing APIs. Reuse its Zod schemas, UI components, and i18n integration where they fit.
- Use `defaultRule` for initial rules when Filter Sphere owns the state. If the host owns the rules, pass `ruleValue` and update it through `onRuleChange`.

## Choose the relevant guide

Before implementing a change, read the guides for that task. Follow only the relevant rows. The links below work from a consuming project without a checkout of the fn-sphere repository.

| Task                                            | Read                                                                                                                                                                  |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Integrate a React filter UI                     | [Getting Started](https://www.waterwater.moe/fn-sphere/guides/getting-started/), [Best Practices](https://www.waterwater.moe/fn-sphere/guides/best-practices/)        |
| Change controls or rule layouts                 | [Theme](https://www.waterwater.moe/fn-sphere/customization/theme/)                                                                                                    |
| Translate labels or compose localized sentences | [Localization](https://www.waterwater.moe/fn-sphere/customization/localization/)                                                                                      |
| Read application metadata from field schemas    | [Schema Metadata](https://www.waterwater.moe/fn-sphere/customization/schema-metadata/)                                                                                |
| Change how parameter schemas map to inputs      | [Data Input](https://www.waterwater.moe/fn-sphere/customization/data-input/)                                                                                          |
| Add filtering behavior                          | [Customizing Filters](https://www.waterwater.moe/fn-sphere/customization/filter/), [Preset Filters](https://www.waterwater.moe/fn-sphere/reference/presets/)          |
| Save or restore rules                           | [Persistence](https://www.waterwater.moe/fn-sphere/customization/persistence/)                                                                                        |
| Sort data or add compare functions              | [Sort Getting Started](https://www.waterwater.moe/fn-sphere/sort/getting-started/), [Custom Sort Functions](https://www.waterwater.moe/fn-sphere/sort/customization/) |

For implementation references, consult [Example](https://www.waterwater.moe/fn-sphere/reference/example/). Adapt the relevant parts to the host project's requirements.

## React setup

If dependencies are missing, add them with the host project's package manager. For a React integration using pnpm:

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

For reusable integrations, expose the configuration and rule state that consumers need. Keep application-specific labels, data, and layout outside shared theme components. Read Best Practices for module boundaries.
