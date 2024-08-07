import { forwardRef } from "react";
import { z } from "zod";
import { useRootRule } from "../hooks/use-root-rule.js";
import { useView } from "../theme/hooks.js";
import type { DataInputViewSpec } from "../theme/types.js";

export const presetDataInputSpecs: DataInputViewSpec[] = [
  {
    // Use when user selects a field with no input
    name: "no need input",
    match: [],
    view: forwardRef(() => {
      return null;
    }),
  },
  {
    name: "string",
    match: [z.string()],
    view: forwardRef(({ requiredDataSchema, rule, updateInput }, ref) => {
      const { Input: InputView } = useView("components");
      if (!requiredDataSchema.length) {
        return null;
      }
      const value = (rule.args?.[0] as string | undefined) ?? "";
      return (
        <InputView
          ref={ref}
          type="text"
          value={value}
          onChange={(newValue) => {
            if (!newValue.length) {
              updateInput([]);
              return;
            }
            updateInput([newValue]);
            return;
          }}
        />
      );
    }),
  },
  {
    name: "number",
    match: [z.number()],
    view: forwardRef(({ requiredDataSchema, rule, updateInput }, ref) => {
      const { Input: InputView } = useView("components");
      if (!requiredDataSchema.length) {
        return null;
      }
      const value = (rule.args?.[0] as number) ?? "";
      return (
        <InputView
          ref={ref}
          type="number"
          value={value}
          onChange={(newValue) => {
            if (!newValue.length) {
              updateInput([]);
              return;
            }
            updateInput([+newValue]);
            return;
          }}
        />
      );
    }),
  },
  {
    name: "date",
    match: [z.date()],
    view: forwardRef(({ requiredDataSchema, rule, updateInput }, ref) => {
      const { Input: InputView } = useView("components");
      if (!requiredDataSchema.length) {
        return null;
      }

      const value = rule.args?.[0]
        ? new Date(rule.args?.[0] as Date).toISOString().slice(0, 10)
        : "";

      return (
        <InputView
          ref={ref}
          type="date"
          // "yyyy-MM-dd"
          value={value}
          onChange={(newValue) => {
            if (!newValue) {
              updateInput([]);
              return;
            }
            updateInput([new Date(newValue)]);
          }}
        />
      );
    }),
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
    view: function LiteralSelect({ requiredDataSchema, rule, updateInput }) {
      const { Select: SelectView } = useView("components");
      const { getLocaleText } = useRootRule();
      const unionSchema = requiredDataSchema[0] as z.ZodUnion<
        [z.ZodLiteral<unknown>]
      >;
      const options = unionSchema.options.map(
        (item: z.ZodLiteral<unknown>) => ({
          label: getLocaleText(item.description ?? String(item.value)),
          value: item.value,
        }),
      );
      return (
        <SelectView
          options={options}
          value={rule.args?.[0]}
          onChange={(value) => {
            updateInput([value]);
          }}
        />
      );
    },
  },
] satisfies DataInputViewSpec[];
