import { isSameType } from "@fn-sphere/core";
import { useEffect, useRef, type ComponentType } from "react";
import { z } from "zod";
import type { $ZodType } from "zod/v4/core";

type InputViewProps = {
  value: unknown;
  onChange: (value: unknown) => void;
  label: string;
};

type InputViewSpec = {
  match: $ZodType;
  view: ComponentType<InputViewProps>;
};

const inputClass =
  "nodrag nowheel min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-right font-mono text-slate-900 outline-none focus:border-violet-400 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

const inputViews: InputViewSpec[] = [
  {
    match: z.number(),
    view: function NumberInput({ value, onChange, label }) {
      return (
        <input
          aria-label={label}
          type="number"
          step="any"
          value={typeof value === "number" && !Number.isNaN(value) ? value : ""}
          onChange={(event) =>
            onChange(
              event.currentTarget.value === ""
                ? undefined
                : event.currentTarget.valueAsNumber,
            )
          }
          className={inputClass}
        />
      );
    },
  },
  {
    match: z.boolean(),
    view: function BooleanInput({ value, onChange, label }) {
      return (
        <select
          aria-label={label}
          value={typeof value === "boolean" ? String(value) : ""}
          onChange={(event) =>
            onChange(
              event.currentTarget.value === ""
                ? undefined
                : event.currentTarget.value === "true",
            )
          }
          className={inputClass}
        >
          <option value="">—</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    },
  },
  {
    match: z.string(),
    view: function StringInput({ value, onChange, label }) {
      return (
        <input
          aria-label={label}
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.currentTarget.value)}
          className={inputClass}
        />
      );
    },
  },
];

export function SchemaInput({
  schema,
  ...props
}: InputViewProps & { schema: $ZodType | undefined }) {
  const View = schema
    ? inputViews.find((spec) => isSameType(spec.match, schema))?.view
    : undefined;
  const previousView = useRef(View);
  const { onChange } = props;

  useEffect(() => {
    if (View) {
      if (previousView.current !== View) onChange(undefined);
      previousView.current = View;
    }
  }, [View, onChange]);

  return View ? (
    <View {...props} />
  ) : (
    <input aria-label={props.label} disabled value="" className={inputClass} />
  );
}
