import { forwardRef } from "react";
import { z } from "zod";
import { useView } from "../specs/hooks.js";
import type { DataInputViewSpec } from "../specs/types.js";

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
      return (
        <InputView
          ref={ref}
          type="text"
          value={(rule.args?.[0] as string) ?? ""}
          onChange={(value) => {
            updateInput([value]);
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
      return (
        <InputView
          ref={ref}
          type="number"
          value={(rule.args?.[0] as string) ?? ""}
          onChange={(value) => {
            updateInput([value]);
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
      return (
        <InputView
          ref={ref}
          type="date"
          value={(rule.args?.[0] as string) ?? ""}
          onChange={(value) => {
            updateInput([value]);
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
      const unionSchema = requiredDataSchema[0] as z.ZodUnion<
        [z.ZodLiteral<unknown>]
      >;
      const options = unionSchema.options.map(
        (item: z.ZodLiteral<unknown>) => ({
          label: item.description ?? String(item.value),
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
