import { z } from "zod";
import type { ViewSpec } from "./types";

export const presetViewSpecs = [
  {
    // Use when user does not select any field
    name: "placeholder",
    match: null,
    view: ({ ref }) => {
      return <input ref={ref} disabled value="" />;
    },
  },
  {
    // Use when user selects a field with no input
    name: "no need input",
    match: z.tuple([]),
    view: () => {
      return null;
    },
  },
  {
    name: "string input",
    match: z.tuple([z.string()]),
    view: ({ ref, inputSchema, rule, onChange }) => {
      if (!inputSchema.items.length) {
        return null;
      }
      return (
        <input
          ref={ref}
          type="text"
          value={(rule.arguments?.[0] as string) ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            onChange({
              ...rule,
              arguments: [value],
            });
            return;
          }}
        />
      );
    },
  },
] satisfies ViewSpec[];
