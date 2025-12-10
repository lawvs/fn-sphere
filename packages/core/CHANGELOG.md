# @fn-sphere/core

## 1.2.0

### Minor Changes

- [`604b283`](https://github.com/lawvs/fn-sphere/commit/604b28300704b40c8a5cfcffaaf9416ce7f42cf9) Thanks [@lawvs](https://github.com/lawvs)! - Add error handling support to filter predicates
  - Added `fallbackValue` parameter to control behavior when filter rules are not available or errors occur (defaults to `true`)
  - Added `errorHandling` option with `catchError` and `logError` properties for configurable error handling (defaults to `{ catchError: true, logError: true }`)
  - Renamed `createFilterPredicate` to `createUnsafeFilterPredicate` (internal use)
  - New `createFilterPredicate` now safely handles errors by default
  - When `fallbackValue` is `true`, items are included in filtered results on error; when `false`, items are excluded

## 1.1.0

### Minor Changes

- [#185](https://github.com/lawvs/fn-sphere/pull/185) [`7a93fcd`](https://github.com/lawvs/fn-sphere/commit/7a93fcdfe4e1e31619c45689e346293aa151955f) Thanks [@lawvs](https://github.com/lawvs)! - Add support for Zod enum types in filter predicates and UI components.
  - Added `enumEquals` and `enumNotEqual` filter functions for enum types
  - Extended `contains` and `notContains` functions to work with `z.enum()` schemas
  - Added enum and enum array data input views for selecting enum values in the filter UI
  - Enum filters are defined separately due to runtime type indistinguishability from strings

## 1.0.0

### Major Changes

- [`15f2755`](https://github.com/lawvs/fn-sphere/commit/15f275543f600969f2c8d724b1ecfed268d49e2b) Thanks [@lawvs](https://github.com/lawvs)! - ## Migrate to Zod 4
  - Upgrade all filtering utilities to Zod 4, adopting the new `z.function({ input, output })` factory.
  - Update tests, docs, and playground examples to reflect the revised function schema API.
  - Surface tuple-based parameter metadata so filter UIs can materialise runtime validators without accessing private internals.
  - Prepare downstream apps for the breaking changes required when upgrading filter definitions to Zod 4.

  ### Migration guide
  - Make sure your project is already on Zod 4 before consuming this release. Review the upstream changes at <https://zod.dev/v4/changelog> to plan any schema updates.
  - Replace every `z.function().args(...).returns(...)` with the new factory signature.

  ```diff
  const equals = defineTypedFn({
    name: "equals",
  -  define: z.function().args(z.string(), z.string()).returns(z.boolean()),
  +  define: z.function({ input: [z.string(), z.string()], output: z.boolean() }),
    implement: (value, target) => value === target,
  });
  ```

  - `getParametersExceptFirst` now returns a `$ZodTuple` rather than a plain array. Use `tuple._zod.def.items` when you need to inspect or parse arguments at runtime.
  - `DataInputViewProps`/`DataInputViewSpec` consume tuple schemas instead of loose arrays:

  ```ts
  // Before
  type DataInputViewProps = {
    rule: SingleFilter;
    requiredDataSchema: [] | [z.ZodTypeAny, ...z.ZodTypeAny[]];
    updateInput: (...input: unknown[]) => void;
  };

  type DataInputViewSpec = {
    name: string;
    match:
      | []
      | [z.ZodTypeAny, ...z.ZodTypeAny[]]
      | ((
          parameterSchemas: [] | [z.ZodTypeAny, ...z.ZodTypeAny[]],
          fieldSchema?: z.ZodTypeAny,
        ) => boolean);
    view: ComponentType<DataInputViewProps>;
  };

  // After
  type DataInputViewProps = {
    rule: SingleFilter;
    requiredDataSchema: $ZodTuple;
    updateInput: (...input: unknown[]) => void;
  };

  type DataInputViewSpec = {
    name: string;
    match:
      | []
      | [$ZodType, ...$ZodType[]]
      | $ZodTuple
      | ((parameterSchemas: $ZodTuple, fieldSchema?: $ZodType) => boolean);
    view: ComponentType<DataInputViewProps>;
  };
  ```

  - Update all usages of `DataInputViewSpec.match` to handle the new tuple schema.

  ```diff
  const literalUnionView: DataInputViewSpec = {
      name: "literal union",
      match: (parameterSchemas) => {
  -     if (parameterSchemas.length !== 1) {
  +     if (parameterSchemas._zod.def.items.length !== 1) {
          return false;
        }
  -     const [item] = parameterSchemas;
  -     const isUnion = item instanceof z.ZodUnion;
  +     const theOnlyItem = parameterSchemas._zod.def.items.at(0);
  +     const schemaDef = (theOnlyItem as $ZodTypes)._zod.def;
  +     const isUnion = schemaDef.type === "union";
        if (!isUnion) {
          return false;
        }

  -     return item.options.every(
  -       (option: unknown) => option instanceof z.ZodLiteral,
  +     return schemaDef.options.every(
  +       (option) => option._zod.def.type === "literal",
  +     );
      },
      view: function View({ requiredDataSchema, rule, updateInput }) {
        const { Select } = useView("components");
        const { getLocaleText } = useRootRule();

        const options = useMemo(() => {
  -       const unionSchema = requiredDataSchema[0] as z.ZodUnion<
  -         [z.ZodLiteral<z.Primitive>]
  -       >;
  +       const unionSchema = requiredDataSchema._zod.def.items[0] as $ZodUnion<
  +         $ZodLiteral[]
  +       >;

  -       return unionSchema.options.map((item: z.ZodLiteral<z.Primitive>) => ({
  +       return unionSchema._zod.def.options.map((item) => {
            const value = item._zod.def.values[0];
            const meta = z.globalRegistry.get(item);
            const metaDesc =
              meta && meta.description ? meta.description : undefined;
            return {
              label: getLocaleText(metaDesc ?? String(value)),
              value,
            };
          });
        }, [getLocaleText, requiredDataSchema]);
        return (
          <Select
            options={options}
            value={rule.args[0]}
            onChange={(value) => {
              updateInput(value);
            }}
          />
        );
      },
    }
  ```

## 0.8.0

### Patch Changes

- [`82696fa`](https://github.com/lawvs/fn-sphere/commit/82696fae32089d1fd88f4d4becdd1b4f05bf6e88) Thanks [@lawvs](https://github.com/lawvs)! - Update dependencies

## 0.6.0

### Minor Changes

- [#51](https://github.com/lawvs/fn-sphere/pull/51) [`a8b07f2`](https://github.com/lawvs/fn-sphere/commit/a8b07f24ed031e5ed3c4396cfdf7a603f5fb2209) Thanks [@lawvs](https://github.com/lawvs)! - Make string filter case insensitive

- [#51](https://github.com/lawvs/fn-sphere/pull/51) [`a8b07f2`](https://github.com/lawvs/fn-sphere/commit/a8b07f24ed031e5ed3c4396cfdf7a603f5fb2209) Thanks [@lawvs](https://github.com/lawvs)! - Add locale supports

  BREAKING CHANGE
  - All name of filter has been changed.
  - The `booleanFilter` has been removed.

- [`01369a8`](https://github.com/lawvs/fn-sphere/commit/01369a805b0fb644ddbb4e7dd334d7896651ac84) Thanks [@lawvs](https://github.com/lawvs)! - Breaking Changes
  - Removed support for array input in `defineTypedFn` and `defineGenericFn`.

### Patch Changes

- [`020bdb1`](https://github.com/lawvs/fn-sphere/commit/020bdb1dbdac9e6dfcf47d01bdeeb05d6bd13612) Thanks [@lawvs](https://github.com/lawvs)! - Add new utils function `createDefaultRule`

## 0.5.0

### Patch Changes

- f5eae65: Remove throw statements in filterFn
- 2b17977: Support literal union in preset fn

## 0.4.0

### Patch Changes

- e0f5632: Fix `isValidRule` incorrectly returned `false` for functions with `skipValidate` enabled

  Now, even if `skipValidate` is enabled, the input data is still checked for length.

- 744b13e: Allow attaching meta to filter rule
- b042713: Add countValidRules function

## 0.3.8

## 0.3.7

## 0.3.6

## 0.3.5

## 0.3.4

## 0.3.3

### Patch Changes

- caeeb9c: Move `createFilterGroup` and `createSingleFilter` to core package.

  Add `getFilterRule` method to `createFilterSphere`.

- 79abaa0: Update readme

## 0.3.2

## 0.3.1

## 0.3.0

### Patch Changes

- b31b201: Rename `filterList` to `filterFnList`

## 0.2.0

## 0.1.2

### Patch Changes

- 336fe84: `getParametersExceptFirst` now returns an array instead of a Zod tuple.

  ```ts
  import { getParametersExceptFirst } from "@fn-sphere/core";

  const schema = {
    name: "test",
    define: z.function().args(z.number(), z.boolean()).returns(z.void()),
    implement: () => {},
  };

  isSameType(z.tuple(getParametersExceptFirst(schema)), z.tuple([z.boolean()]));
  // true
  ```

- b9d3b0a: Rename and export `FilterRule`

  ```ts
  interface SingleFilter {
    type: "Filter";
    /**
     * Field path
     *
     * If it's a empty array, it means the root object.
     * If not provided, it means user didn't select a field.
     */
    path?: FilterPath;
    /**
     * Filter name
     *
     * If not provided, it means user didn't select a filter.
     */
    name?: string;
    /**
     * Arguments for the filter function
     */
    args: unknown[];
    invert?: boolean;
  }

  interface SingleFilter extends SingleFilterInput {
    /**
     * Unique id, used for tracking changes or resorting
     */
    id: FilterId;
  }

  export interface FilterGroupInput {
    type: "FilterGroup";
    op: "and" | "or";
    conditions: (SingleFilter | FilterGroup)[];
    invert?: boolean;
  }

  export interface FilterGroup extends FilterGroupInput {
    /**
     * Unique id, used for tracking changes or resorting
     */
    id: FilterId;
  }

  export type FilterRule = SingleFilter | FilterGroup;
  ```

## 0.1.0

### Minor Changes

- 5c84d94: first publish
