/* eslint-disable react-refresh/only-export-components */
import { forwardRef } from "react";
import { z } from "zod";
import { useView } from "../hooks.js";
import type { DataInputViewSpec } from "../types.js";

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
    view: forwardRef(({ requiredDataSchema, rule, onChange }, ref) => {
      const InputView = useView("Input");
      if (!requiredDataSchema.length) {
        return null;
      }
      return (
        <InputView
          ref={ref}
          type="text"
          value={(rule.arguments?.[0] as string) ?? ""}
          onChange={(value) => {
            onChange({
              ...rule,
              arguments: [value],
            });
            return;
          }}
        />
      );
    }),
  },
  {
    name: "number",
    match: [z.number()],
    view: forwardRef(({ requiredDataSchema, rule, onChange }, ref) => {
      const InputView = useView("Input");
      if (!requiredDataSchema.length) {
        return null;
      }
      return (
        <InputView
          ref={ref}
          type="number"
          value={(rule.arguments?.[0] as string) ?? ""}
          onChange={(value) => {
            onChange({
              ...rule,
              arguments: [value],
            });
            return;
          }}
        />
      );
    }),
  },
  {
    name: "date",
    match: [z.date()],
    view: forwardRef(({ requiredDataSchema, rule, onChange }, ref) => {
      const InputView = useView("Input");
      if (!requiredDataSchema.length) {
        return null;
      }
      return (
        <InputView
          ref={ref}
          type="date"
          value={(rule.arguments?.[0] as string) ?? ""}
          onChange={(value) => {
            onChange({
              ...rule,
              arguments: [value],
            });
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
    view: function LiteralSelect({ requiredDataSchema, rule, onChange }) {
      const SelectView = useView("Select");
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
          value={rule.arguments?.[0]}
          onChange={(value) => {
            onChange({
              ...rule,
              arguments: [value],
            });
          }}
        />
      );
    },
  },
] satisfies DataInputViewSpec[];
