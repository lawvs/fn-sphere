import { forwardRef, type InputHTMLAttributes } from "react";
import { z } from "zod";
import { useInputView } from "./hooks";
import type { DataInputViewSpec, ViewSpec } from "./types";

export const presetDataInputSpecs: DataInputViewSpec[] = [
  {
    // Use when user selects a field with no input
    name: "no need input",
    match: z.tuple([]),
    view: forwardRef(() => {
      return null;
    }),
  },
  {
    name: "string",
    match: z.tuple([z.string()]),
    view: forwardRef(({ inputSchema, rule, onChange }, ref) => {
      const Input = useInputView();
      if (!inputSchema.items.length) {
        return null;
      }
      return (
        <Input
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
    }),
  },
  {
    name: "number",
    match: z.tuple([z.number()]),
    view: forwardRef(({ inputSchema, rule, onChange }, ref) => {
      const Input = useInputView();
      if (!inputSchema.items.length) {
        return null;
      }
      return (
        <Input
          ref={ref}
          type="number"
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
    }),
  },
  {
    name: "date",
    match: z.tuple([z.date()]),
    view: forwardRef(({ inputSchema, rule, onChange }, ref) => {
      const Input = useInputView();
      if (!inputSchema.items.length) {
        return null;
      }
      return (
        <Input
          ref={ref}
          type="date"
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
    }),
  },
] satisfies DataInputViewSpec[];

// eslint-disable-next-line react-refresh/only-export-components
const DefaultInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return <input type={type} className={className} ref={ref} {...props} />;
});

// eslint-disable-next-line react-refresh/only-export-components
const DataInputPlaceholder = forwardRef<HTMLInputElement>((_, ref) => {
  const Input = useInputView();
  return <Input ref={ref} disabled />;
});

export const presetView: ViewSpec = {
  input: DefaultInput,
  // Use when user does not select any field
  dataInputPlaceholder: DataInputPlaceholder,
  dataInputViews: presetDataInputSpecs,
} satisfies ViewSpec;
