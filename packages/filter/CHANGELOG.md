# @fn-sphere/filter

## 1.1.0

### Minor Changes

- [#185](https://github.com/lawvs/fn-sphere/pull/185) [`7a93fcd`](https://github.com/lawvs/fn-sphere/commit/7a93fcdfe4e1e31619c45689e346293aa151955f) Thanks [@lawvs](https://github.com/lawvs)! - Add support for Zod enum types in filter predicates and UI components.
  - Added `enumEquals` and `enumNotEqual` filter functions for enum types
  - Extended `contains` and `notContains` functions to work with `z.enum()` schemas
  - Added enum and enum array data input views for selecting enum values in the filter UI
  - Enum filters are defined separately due to runtime type indistinguishability from strings

### Patch Changes

- Updated dependencies [[`7a93fcd`](https://github.com/lawvs/fn-sphere/commit/7a93fcdfe4e1e31619c45689e346293aa151955f)]:
  - @fn-sphere/core@1.1.0

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

### Patch Changes

- Updated dependencies [[`15f2755`](https://github.com/lawvs/fn-sphere/commit/15f275543f600969f2c8d724b1ecfed268d49e2b)]:
  - @fn-sphere/core@1.0.0

## 0.8.0

### Minor Changes

- [`a915a9a`](https://github.com/lawvs/fn-sphere/commit/a915a9a52f442de8843c68063fb53fc2755e0e57) Thanks [@lawvs](https://github.com/lawvs)! - feat(filter)!: retain args by default when filter changes via tryRetainArgs
  - BREAKING: FieldSelect and FilterSelect now default `tryRetainArgs` (and `tryRetainFilter` for fields) to `true`. Previously, leaving these props undefined defaulted to resetting `args`. To restore the old behavior, explicitly pass `tryRetainArgs={false}` (and/or `tryRetainFilter={false}`).
  - When switching filters within the same field, if the new filter's parameter schema is compatible, existing `args` are preserved.
  - Data input "literal union" options are memoized for stability.

  This change improves UX by avoiding unnecessary argument resets when changing a filter, while still allowing users to opt out.

### Patch Changes

- [`82696fa`](https://github.com/lawvs/fn-sphere/commit/82696fae32089d1fd88f4d4becdd1b4f05bf6e88) Thanks [@lawvs](https://github.com/lawvs)! - Update dependencies

- Updated dependencies [[`82696fa`](https://github.com/lawvs/fn-sphere/commit/82696fae32089d1fd88f4d4becdd1b4f05bf6e88)]:
  - @fn-sphere/core@0.8.0

## 0.7.2

### Patch Changes

- [#105](https://github.com/lawvs/fn-sphere/pull/105) [`941d4a9`](https://github.com/lawvs/fn-sphere/commit/941d4a9a6d523428c39c82264ce4fc32af73be77) Thanks [@Garfield550](https://github.com/Garfield550)! - Fix the incorrect version of @types/react in peer dependencies.

## 0.7.1

### Patch Changes

- [`2843855`](https://github.com/lawvs/fn-sphere/commit/284385506bc6ae8503bb04ad7968edaf8ff2d21c) Thanks [@lawvs](https://github.com/lawvs)! - Fix package build error

## 0.7.0

### Minor Changes

- [`0c4bea5`](https://github.com/lawvs/fn-sphere/commit/0c4bea55f5e281c4494ed5cd2baf984dc18dc1e6) Thanks [@lawvs](https://github.com/lawvs)! - BREAKING CHANGE: Upgrade to react 19

## 0.6.0

### Minor Changes

- [`ef470f1`](https://github.com/lawvs/fn-sphere/commit/ef470f179cda345a441f98e0b8d765598080d551) Thanks [@lawvs](https://github.com/lawvs)! - Breaking Changes
  - Now the first field and the first filter will be selected by default when creating a new rule.
    - Updated `useFilterSphere` to use `createDefaultRule` for default rule creation.
    - Updated `useFilterGroup` and `useFilterRule` to use `createDefaultRule` when no input is provided.

- [`62aeaf0`](https://github.com/lawvs/fn-sphere/commit/62aeaf054cb90701cabbe4c2389145d8bbaed9f7) Thanks [@lawvs](https://github.com/lawvs)! - Export `filterableFields` in `useRootRule` hook.
  Remove `filterableFields` from `useFilterRule` hook.

  BREAKING CHANGE: The `filterableFields` is now exported in the `useRootRule` hook instead of the `useFilterRule` hook.

  Migration:

  ```diff
  + const { filterableFields } = useRootRule();
  - const { filterableFields } = useFilterRule(rule);
  ```

- [#51](https://github.com/lawvs/fn-sphere/pull/51) [`a8b07f2`](https://github.com/lawvs/fn-sphere/commit/a8b07f24ed031e5ed3c4396cfdf7a603f5fb2209) Thanks [@lawvs](https://github.com/lawvs)! - Add locale supports

  BREAKING CHANGE
  - All name of filter has been changed.
  - The `booleanFilter` has been removed.

- [`9badd88`](https://github.com/lawvs/fn-sphere/commit/9badd88890b39141b6ae5ce02865d8cc5b938a9a) Thanks [@lawvs](https://github.com/lawvs)! - Breaking Changes
  - Renamed `filterGroup` prop to `rule` in FilterGroupContainer.
  - Modified `filterTheme` in theme-mui-material to use `rule` instead of `filterGroup`.

### Patch Changes

- [`964faf3`](https://github.com/lawvs/fn-sphere/commit/964faf32dfb0f0e982063ee5a8a496e1a799b9c9) Thanks [@lawvs](https://github.com/lawvs)! - Add depth limit for filter group

- [`5f4d54f`](https://github.com/lawvs/fn-sphere/commit/5f4d54fab3506577f08c1eae7c20d7f11f8f7e95) Thanks [@lawvs](https://github.com/lawvs)! - Rename `updateRootRule` to `setRootRule` in `useRootRule` hook

  Migration:

  ```diff
  - const { updateRootRule } = useRootRule();
  + const { setRootRule } = useRootRule();
  ```

- [`200e5a1`](https://github.com/lawvs/fn-sphere/commit/200e5a1587797ee35651bc8735a9507f8ff4d4b3) Thanks [@lawvs](https://github.com/lawvs)! - Deprecated `getRootRule` in favor of `rootRule` in `useRootRule` hook.

  Migration:

  ```diff
  + const { rootRule } = useRootRule();
  - const { getRootRule } = useRootRule();
  ```

- [`479f048`](https://github.com/lawvs/fn-sphere/commit/479f0488e42283656d8f59b515775435b0a9338b) Thanks [@lawvs](https://github.com/lawvs)! - Fix logical error in `toggleGroupOp` function within the `useFilterGroup` hook

- [`8337984`](https://github.com/lawvs/fn-sphere/commit/8337984b832bd11652159ccf15c7fdbe0a300889) Thanks [@lawvs](https://github.com/lawvs)! - Support custom style for components

- [`6be8772`](https://github.com/lawvs/fn-sphere/commit/6be8772d0e3dca728a52404da911844c01e2cda6) Thanks [@lawvs](https://github.com/lawvs)! - Support `moveRule` in `useFilterRule`

- Updated dependencies [[`a8b07f2`](https://github.com/lawvs/fn-sphere/commit/a8b07f24ed031e5ed3c4396cfdf7a603f5fb2209), [`020bdb1`](https://github.com/lawvs/fn-sphere/commit/020bdb1dbdac9e6dfcf47d01bdeeb05d6bd13612), [`a8b07f2`](https://github.com/lawvs/fn-sphere/commit/a8b07f24ed031e5ed3c4396cfdf7a603f5fb2209), [`01369a8`](https://github.com/lawvs/fn-sphere/commit/01369a805b0fb644ddbb4e7dd334d7896651ac84)]:
  - @fn-sphere/core@0.6.0

## 0.5.0

### Minor Changes

- ab1a0c6: - Deprecated `onPredicateChange` in `useFilterSphere`
  - ⚠️ BREAKING CHANGES
    - The `onRuleChange` callback in `useFilterSphere` now receives an object with both `filterRule` and `predicate` properties, instead of just the `filterRule`.
    - The `onPredicateChange` callback has been removed. Use the `predicate` property in the `onRuleChange` callback instead.

    ```ts
    export interface FilterSphereInput<
      Data,
    > extends BasicFilterSphereInput<Data> {
      onRuleChange?: (data: {
        filterRule: FilterGroup;
        predicate: (data: Data) => boolean;
      }) => void;
    }

    const { context } = useFilterSphere({
      schema: YOUR_DATA_SCHEMA,
      onRuleChange: ({ predicate }) => {
        const filteredData = YOUR_DATA.filter(predicate);
        console.log(filteredData);
      },
    });
    ```

  - Migration Guide

  ```diff
  const { context } = useFilterSphere({
    schema: YOUR_DATA_SCHEMA,
  -  onRuleChange: (filterRule) => {
  -    console.log(filterRule);
  -  },
  -  onPredicateChange: (predicate) => {
  -    const filteredData = YOUR_DATA.filter(predicate);
  -    console.log(filteredData);
  -  },
  +  onRuleChange: ({ filterRule, predicate }) => {
  +    const filteredData = YOUR_DATA.filter(predicate);
  +    console.log(filterRule, filteredData);
  +  },
  });
  ```

- 87acc5e: - BREAKING CHANGES
  - `updateInput` in `DataInputViewProps` now use spread parameter to accept new values.

  ```diff
  - updateInput([newValue]);
  + updateInput(newValue);
  ```

- 70565bc: - BREAKING CHANGES
  - Increased spacing in templates
  - Enhanced `SingleFilterContainer` styling:
    - Improved vertical alignment of child elements
  - Remove `isValid` flag from `FilterRule`
  - Move `Add Condition` and `Add Group` buttons to the `FilterGroupContainer`

### Patch Changes

- 4a6e88a: Support multiple select for literal union
- 03624b8: Add multiple select
- f03f6e2: Remove unnecessary ref prop from data input views
- Updated dependencies [f5eae65]
- Updated dependencies [2b17977]
  - @fn-sphere/core@0.5.0

## 0.4.0

### Minor Changes

- 55b7fb1: - In `useFilterSelect`:
  - The `updateField` function has been deprecated and replaced with `setField` for clarity and consistency.
  - The `updateFilter` function has been deprecated and replaced with `setFilter`.
  - In `useFilterRule`:
    - The `updateRule` function has been renamed to `setRule`
    - Added a new `duplicateRule` function to duplicate a rule.
    - Added a new `invertRule` function.
  - In `useFilterGroup` and `useFilterRule`:
    - The parameter `SingleFilter` has been changed to `SingleFilterInput` for simplicity.
    - The parameter `FilterGroup` has been changed to `FilterGroupInput` for simplicity.
- e05bcbe: Removed inline theme merging logic from `FilterSphereProvider`.

  Introduced `createFilterTheme` for theme merging.

  Migration guide:

  ```diff
  -  <FilterSphereProvider theme={customTheme}>
  + const theme = createFilterTheme(customTheme);
  +  <FilterSphereProvider theme={theme}>
  ```

### Patch Changes

- 0ce4129: Add `tryRetainArgs` to allow retaining `args` when filter is changed
- d4c6a7d: - Update `useFilterSphere` hook to use `predicate` instead of `getPredicate`:

  ```diff
  import { useFilterSphere } from "@fn-sphere/filter";

  - const { rule, predicate, context } = useFilterSphere({
  + const { rule, getPredicate, context } = useFilterSphere({
    schema: YOUR_DATA_SCHEMA,
  });

  - const filteredData = YOUR_DATA.filter(getPredicate());
  + const filteredData = YOUR_DATA.filter(predicate);
  ```

  - Update `countTotalRules()` to `get totalRuleCount` in `useFilterSphere` hook
  - Add `validRuleCount` to `useFilterSphere` hook to get the count of valid rules

- c5ad41a: Add `countValidRules` function to `useFilterSphere` hook

  ```ts
  const { countValidRules } = useFilterSphere();
  const validRulesCount = countValidRules();
  ```

- 311f306: - Added the ability to retain the current filter and arguments when the field is changed in the `useFilterSelect` hook.
  - Introduced the `UpdateFieldOptions` type to specify the behavior when updating the field.
  - Updated the `FieldSelect` component to pass the `updateFieldOptions` to the `updateField` function.

  ```tsx
  export type UpdateFieldOptions = {
    /**
     * Try to continue using the current filter when the field is changed.
     *
     * @default true
     */
    tryRetainFilter?: boolean;
    /**
     * Automatically select the first filter when the field is changed and the filter is not retained.
     *
     * @default true
     */
    autoSelectFirstFilter?: boolean;
    /**
     * Try to continue using the current args when the field is changed.
     *
     * @default true
     */
    tryRetainArgs?: boolean;
  };

  <FieldSelect
    rule={rule}
    tryRetainFilter
    autoSelectFirstFilter
    tryRetainArgs
  />;
  ```

- Updated dependencies [e0f5632]
- Updated dependencies [744b13e]
- Updated dependencies [b042713]
  - @fn-sphere/core@0.4.0

## 0.3.8

### Patch Changes

- 19e8e38: Update preset templates
  - @fn-sphere/core@0.3.8

## 0.3.7

### Patch Changes

- 715e792: Add `getLocaleText` API
  - @fn-sphere/core@0.3.7

## 0.3.6

### Patch Changes

- b272f24: Export `FnSchema`, `StandardFnSchema` and `GenericFnSchema` type from core package.

  Export `defineGenericFn` and `defineTypedFn` from core package.
  - @fn-sphere/core@0.3.6

## 0.3.5

### Patch Changes

- 98b38de: Add field schema to the match function in the `DataInputViewSpec`.
- 75feec4: Update data input view to handle empty values

  If input value is empty string, the input view will update the rule args to `[]` instead of `[""]`. This is to prevent the rule from running with an empty string as an argument.
  - @fn-sphere/core@0.3.5

## 0.3.4

### Patch Changes

- 51abfaa: Export `FilterField`
  - @fn-sphere/core@0.3.4

## 0.3.3

### Patch Changes

- caeeb9c: Move `createFilterGroup` and `createSingleFilter` to core package.

  Add `getFilterRule` method to `createFilterSphere`.

- 79abaa0: Update readme
- Updated dependencies [caeeb9c]
- Updated dependencies [79abaa0]
  - @fn-sphere/core@0.3.3

## 0.3.2

### Patch Changes

- 2a8d304: Add new `reset` method to `useFilterSphere` hook
- 3ccf45a: Update styles for default templates
  - @fn-sphere/core@0.3.2

## 0.3.1

### Patch Changes

- aef8fbc: Fix `numberOfRules` should only count the SingleRule and not the RuleGroup.

  Return `countTotalRules` function to `useFilterSphere` hook.
  - @fn-sphere/core@0.3.1

## 0.3.0

### Minor Changes

- 49df2cd: Add new `FilterSphereProvider` component to provide filter context to children components.

  Add `useFilterSphere` hook to access filter predicate.

  The `FilterBuilder` component no longer adds a provider to its child components.

  ```ts
  const { filterRule, schema, predicate } = useFilterSphere<YourData>();
  const filteredData = data.filter(predicate);
  ```

- c66db35: Redesign `useFilterSphere` hook to return a `getPredicate` function and a `context` object.

  ```ts
  import { useFilterSphere } from "@fn-sphere/filter";

  const { getPredicate, context } = useFilterSphere<YourData>({
    schema: yourDataSchema,
  });
  const predicate = getPredicate();
  const filteredData = data.filter(predicate);
  ```

### Patch Changes

- 1c4bfae: Rename `BasicFilterBuilderProps` to `BasicFilterSphereInput` and update type definitions.

  Export new type `BasicFilterSphereProps`.

  ```ts
  export interface BasicFilterSphereInput<Data = unknown> {
    filterRule: FilterGroup;
    schema: ZodType<Data>;
    filterFnList?: FnSchema[];
    fieldDeepLimit?: number;
    mapFieldName?: (field: FilterField) => string;
    mapFilterName?: (
      filterSchema: StandardFnSchema,
      field: FilterField,
    ) => string;
    onRuleChange?: (rule: FilterGroup) => void;
  }

  export type BasicFilterSphereProps<Data = unknown> = Required<
    BasicFilterSphereInput<Data>
  >;
  ```

- 1ac1c43: Rename `createEmptyFilter` to `createEmptySingleFilter` and `createEmptyFilterGroup` to `createFilterGroup`.
- 1ac1c43: Add `SingleFilterContainer` to template.
- 991d8e7: Export `useRootRule` and `useFilterSelect` hooks.
- b31b201: Rename `filterList` to `filterFnList`
- Updated dependencies [b31b201]
  - @fn-sphere/core@0.3.0

## 0.2.0

### Minor Changes

- 742c3af: Refactor API

### Patch Changes

- @fn-sphere/core@0.2.0

## 0.1.3

### Patch Changes

- 1670687: Export presetFilter

## 0.1.2

### Patch Changes

- b9d3b0a: chore: add type export for filter specs
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

- Updated dependencies [336fe84]
- Updated dependencies [b9d3b0a]
  - @fn-sphere/core@0.1.2

## 0.1.1

### Patch Changes

- d7460ba: export UiSpec

## 0.1.0

### Minor Changes

- 5c84d94: first publish

### Patch Changes

- Updated dependencies [5c84d94]
  - @fn-sphere/core@0.1.0
