---
"@fn-sphere/core": major
"@fn-sphere/filter": major
---

## Migrate to Zod 4

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
