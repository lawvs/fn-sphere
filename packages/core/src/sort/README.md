# Sort Module

Schema-driven, multi-field sorting for Zod-typed data. Mirrors the architecture of the `filter/` module.

## Usage

```ts
import { z } from "zod";
import { createSorterSphere, presetSort } from "@fn-sphere/core";

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

type User = z.infer<typeof schema>;

const sphere = createSorterSphere(schema, presetSort);

// Discover which fields are sortable
const fields = sphere.findSortableField();
const ageField = fields.find((f) => f.path[0] === "age")!;
const ageFn = ageField.sortFnList[0]!;

// Build a sort rule (multi-field supported)
const rule = [sphere.getSortRule(ageField, ageFn, "desc")];

// Sort data (non-mutating)
const sorted = sphere.sortData(users, rule);

// Or get a reusable comparator
const cmp = sphere.getSortComparator(rule);
[...users].sort(cmp);
```

## API

### `createSorterSphere(dataSchema, sortFnList)`

Creates a sort sphere bound to a Zod schema and a list of compare functions.

Returns:

| Method | Description |
|---|---|
| `findSortableField({ maxDeep? })` | BFS-walks the schema and returns fields that have at least one matching compare function. |
| `getSortRule(sortField, fnSchema, dir?)` | Creates a `SortItem` after validating the function belongs to the field. `dir` defaults to `"asc"`. |
| `getSortComparator(rule)` | Returns a `(a, b) => number` comparator. Pre-resolves all functions for performance. Supports multi-field sort (iterates items, first non-zero wins). Negates result for `"desc"`. |
| `sortData(data, rule)` | Returns a new sorted array (`[...data].sort(comparator)`). Never mutates the input. |

### `findSortableFields({ schema, sortFnList, maxDeep? })`

Standalone field discovery (used internally by `createSorterSphere`).

### `presetSort`

A built-in generic compare function that handles `string`, `number`, `boolean`, `Date`, and `enum` fields out of the box.

## Types

```ts
type SortField = {
  path: FilterPath;
  fieldSchema: $ZodType;
  sortFnList: StandardFnSchema[];
};

type SortItem = {
  path: FilterPath;
  name: string;
  dir: "asc" | "desc";
};

type SortRule = SortItem[];
```

## File Structure

| File | Purpose |
|---|---|
| `types.ts` | `SortField`, `SortItem`, `SortRule` type definitions |
| `presets.ts` | `presetSort` — generic compare function for primitive types |
| `field.ts` | `findSortableFields` — BFS schema walking + field discovery |
| `utils.ts` | `instantiateGenericSortFn` — generic-to-concrete sort fn instantiation |
| `sorter.ts` | `createSorterSphere` — main entry point |
| `index.ts` | Public exports |

## Custom Compare Functions

Define typed compare functions with `defineTypedFn`:

```ts
import { z } from "zod";
import { defineTypedFn } from "@fn-sphere/core";

const numberCompare = defineTypedFn({
  name: "number compare",
  define: z.function({
    input: [z.number(), z.number()],
    output: z.number(),
  }),
  implement: (a, b) => a - b,
});

const sphere = createSorterSphere(schema, [numberCompare]);
```

Compare functions must take exactly 2 parameters of the same type and return a `number` (following the [`Array.prototype.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) comparator contract).
