import { z } from "zod";
import { useRootRule } from "../hooks/use-root-rule.js";
import { useView } from "../theme/hooks.js";
import type { DataInputViewSpec } from "../theme/types.js";

export const presetDataInputSpecs: DataInputViewSpec[] = [
  {
    // Use when user selects a field with no input
    name: "no need input",
    match: [],
    view: function View() {
      return null;
    },
  },
  {
    name: "string",
    match: [z.string()],
    view: function View({ requiredDataSchema, rule, updateInput }) {
      const { Input: InputView } = useView("components");
      if (!requiredDataSchema.length) {
        return null;
      }
      const value = (rule.args?.[0] as string | undefined) ?? "";
      return (
        <InputView
          type="text"
          value={value}
          onChange={(newValue) => {
            if (!newValue.length) {
              updateInput();
              return;
            }
            updateInput(newValue);
            return;
          }}
        />
      );
    },
  },
  {
    name: "number",
    match: [z.number()],
    view: function View({ requiredDataSchema, rule, updateInput }) {
      const { Input: InputView } = useView("components");
      if (!requiredDataSchema.length) {
        return null;
      }
      const value = (rule.args?.[0] as number) ?? "";
      return (
        <InputView
          type="number"
          value={value}
          onChange={(newValue) => {
            if (!newValue.length) {
              updateInput();
              return;
            }
            updateInput(+newValue);
            return;
          }}
        />
      );
    },
  },
  {
    name: "date",
    match: [z.date()],
    view: function View({ requiredDataSchema, rule, updateInput }) {
      const { Input: InputView } = useView("components");
      if (!requiredDataSchema.length) {
        return null;
      }

      const value = rule.args?.[0]
        ? new Date(rule.args?.[0] as Date).toISOString().slice(0, 10)
        : "";

      return (
        <InputView
          type="date"
          // "yyyy-MM-dd"
          value={value}
          onChange={(newValue) => {
            if (!newValue) {
              updateInput();
              return;
            }
            updateInput(new Date(newValue));
          }}
        />
      );
    },
  },
  {
    name: "literal union",
    match: (parameterSchemas) => {
      if (parameterSchemas.length !== 1) {
        return false;
      }
      const [item] = parameterSchemas;
      const isUnion = item instanceof z.ZodUnion;
      if (!isUnion) {
        return false;
      }
      return item.options.every(
        (option: unknown) => option instanceof z.ZodLiteral,
      );
    },
    view: function View({ requiredDataSchema, rule, updateInput }) {
      const { MultipleSelect } = useView("components");
      const { getLocaleText } = useRootRule();
      const unionSchema = requiredDataSchema[0] as z.ZodUnion<
        [z.ZodLiteral<z.Primitive>]
      >;
      const options = unionSchema.options.map(
        (item: z.ZodLiteral<z.Primitive>) => ({
          label: getLocaleText(item.description ?? String(item.value)),
          value: item.value,
        }),
      );
      return (
        <MultipleSelect
          options={options}
          value={rule.args?.[0] as z.Primitive[]}
          onChange={(value) => {
            updateInput(value);
          }}
        />
      );
    },
  },
  {
    name: "literal array",
    match: (parameterSchemas) => {
      if (parameterSchemas.length !== 1) {
        return false;
      }
      const [item] = parameterSchemas;
      return (
        item instanceof z.ZodArray &&
        item.element instanceof z.ZodUnion &&
        item.element.options.every(
          (op: z.ZodType) => op instanceof z.ZodLiteral,
        )
      );
    },
    view: function View({ requiredDataSchema, rule, updateInput }) {
      const { MultipleSelect: MultipleSelectView } = useView("components");
      const { getLocaleText } = useRootRule();
      const arraySchema = requiredDataSchema[0] as z.ZodArray<
        z.ZodUnion<[z.ZodLiteral<z.Primitive>]>
      >;
      const unionSchema = arraySchema.element;
      const options = unionSchema.options.map((item) => ({
        label: getLocaleText(item.description ?? String(item.value)),
        value: item.value,
      }));
      const value = (rule.args?.[0] ?? []) as z.Primitive[];
      return (
        <MultipleSelectView<z.Primitive>
          value={value}
          options={options}
          onChange={(newValue) => {
            if (!newValue?.length) {
              updateInput();
              return;
            }
            updateInput(newValue);
          }}
        />
      );
    },
  },
] satisfies DataInputViewSpec[];
