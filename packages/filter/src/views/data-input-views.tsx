import { useMemo } from "react";
import { z } from "zod";
import type { $ZodTypes, $ZodUnion } from "zod/v4/core";
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
    name: "boolean",
    match: [z.boolean()],
    view: function View({ rule, updateInput }) {
      const { getLocaleText } = useRootRule();
      const { Select } = useView("components");
      const options = [
        { label: getLocaleText("valueTrue"), value: true },
        { label: getLocaleText("valueFalse"), value: false },
      ];
      return (
        <Select
          options={options}
          value={rule.args[0] as boolean}
          onChange={(value) => {
            updateInput(value);
          }}
        />
      );
    },
  },
  {
    name: "string",
    match: [z.string()],
    view: function View({ requiredDataSchema, rule, updateInput }) {
      const { Input: InputView } = useView("components");
      if (!requiredDataSchema._zod.def.items.length) {
        return null;
      }
      const value = (rule.args[0] as string | undefined) ?? "";
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
      if (!requiredDataSchema._zod.def.items.length) {
        return null;
      }
      const value = (rule.args[0] as number) ?? "";
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
      if (!requiredDataSchema._zod.def.items.length) {
        return null;
      }

      const value = rule.args[0]
        ? new Date(rule.args[0] as Date).toISOString().slice(0, 10)
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
      if (parameterSchemas._zod.def.items.length !== 1) {
        return false;
      }
      const theOnlyItem = parameterSchemas._zod.def.items.at(0);
      const schemaDef = (theOnlyItem as $ZodTypes)._zod.def;
      const isUnion = schemaDef.type === "union";
      if (!isUnion) {
        return false;
      }
      return schemaDef.options.every(
        (option) => option._zod.def.type === "literal",
      );
    },
    view: function View({ requiredDataSchema, rule, updateInput }) {
      const { Select } = useView("components");
      const { getLocaleText } = useRootRule();

      const options = useMemo(() => {
        const unionSchema = requiredDataSchema._zod.def.items[0] as z.ZodUnion<
          [z.ZodLiteral]
        >;
        return unionSchema.options.map((item: z.ZodLiteral) => ({
          label: getLocaleText(item.description ?? String(item.value)),
          value: item.value,
        }));
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
  },
  {
    name: "literal array",
    match: (parameterSchemas) => {
      if (parameterSchemas._zod.def.items.length !== 1) {
        return false;
      }
      const theOnlyItem = parameterSchemas._zod.def.items.at(0);
      const schemaDef = (theOnlyItem as $ZodTypes)._zod.def;
      return (
        schemaDef.type === "array" &&
        schemaDef.element._zod.def.type === "union" &&
        (schemaDef.element as $ZodUnion)._zod.def.options.every(
          (op) => op._zod.def.type === "literal",
        )
      );
    },
    view: function View({ requiredDataSchema, rule, updateInput }) {
      const { MultipleSelect: MultipleSelectView } = useView("components");
      const { getLocaleText } = useRootRule();
      const arraySchema = requiredDataSchema._zod.def.items[0] as z.ZodArray<
        z.ZodUnion<[z.ZodLiteral]>
      >;
      const unionSchema = arraySchema.element;
      const options = unionSchema.options.map((item) => ({
        label: getLocaleText(item.description ?? String(item.value)),
        value: item.value,
      }));
      const value = (rule.args[0] ?? []) as z.core.util.Literal[];
      return (
        <MultipleSelectView
          value={value}
          options={options}
          onChange={(newValue) => {
            if (!newValue.length) {
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
