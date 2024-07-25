/* eslint-disable react-refresh/only-export-components */
import type { LooseFilterGroup, LooseFilterRule } from "@fn-sphere/core";
import {
  forwardRef,
  useCallback,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { z } from "zod";
import { FilterGroup } from "../filter-group.js";
import { FilterRule } from "../filter-rule/index.js";
import { usePrimitives, useView } from "./hooks.js";
import { primitives } from "./primitives.js";
import type { DataInputViewSpec, SelectProps, uiSpec } from "./types.js";

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
      const InputView = useView("Input");
      if (!inputSchema.items.length) {
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
    match: z.tuple([z.number()]),
    view: forwardRef(({ inputSchema, rule, onChange }, ref) => {
      const InputView = useView("Input");
      if (!inputSchema.items.length) {
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
    match: z.tuple([z.date()]),
    view: forwardRef(({ inputSchema, rule, onChange }, ref) => {
      const InputView = useView("Input");
      if (!inputSchema.items.length) {
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
            return;
          }}
        />
      );
    }),
  },
] satisfies DataInputViewSpec[];

const ButtonView = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  const ButtonPrimitive = usePrimitives("button");
  return <ButtonPrimitive ref={ref} {...props} />;
});

const InputView = forwardRef<
  HTMLInputElement,
  {
    onChange?: (value: string) => void;
  }
>(({ onChange, ...props }, ref) => {
  const InputPrimitive = usePrimitives("input");
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    },
    [onChange],
  );
  return <InputPrimitive ref={ref} onChange={handleChange} {...props} />;
});

const SelectView = <T,>({
  options = [],
  value,
  onChange,
  ...props
}: SelectProps<T>) => {
  const SelectPrimitive = usePrimitives("select");
  const OptionPrimitive = usePrimitives("option");
  const selectedIdx = options.findIndex((option) => option.value === value);
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const index = Number(e.target.value);
      onChange?.(options[index].value);
    },
    [options, onChange],
  );
  return (
    <SelectPrimitive value={selectedIdx} onChange={handleChange} {...props}>
      <OptionPrimitive key={-1} value={-1} hidden disabled></OptionPrimitive>
      {options.map(({ label }, index) => (
        <OptionPrimitive key={label} value={index}>
          {label}
        </OptionPrimitive>
      ))}
    </SelectPrimitive>
  );
};

const DataInputPlaceholder = forwardRef<HTMLInputElement>((_, ref) => {
  const InputView = useView("Input");
  return <InputView ref={ref} disabled />;
});

const RuleJoiner = ({
  parent,
}: {
  parent: LooseFilterGroup;
  joinBetween: [
    LooseFilterRule | LooseFilterGroup,
    LooseFilterRule | LooseFilterGroup,
  ];
}) => {
  const operator = parent.op;
  return (
    <div
      style={{
        margin: 8,
      }}
    >
      {operator === "or" ? "Or" : "And"}
    </div>
  );
};

const FilterGroupContainer = ({
  filterGroup,
  children,
}: {
  filterGroup: LooseFilterGroup;
  children?: ReactNode;
}) => {
  // const {
  //   ruleState: { isRoot },
  // } = useFilterGroup(filterGroup);
  // if (isRoot) {
  //   return children;
  // }

  const text = filterGroup.op === "or" ? "Or" : "And";
  return (
    <div
      className="filter-builder-group-container"
      style={{
        display: "flex",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        {text}
      </div>
      <div
        style={{
          borderRadius: 4,
          padding: 4,
          background: "rgba(0, 0, 0, 0.05)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const presetSpec: uiSpec = {
  // primitive
  primitives,
  views: {
    Button: ButtonView,
    Input: InputView,
    Select: SelectView,
    FilterRule,
    FilterGroup,
    RuleJoiner,
    // Use when user does not select any field
    DataInputPlaceholder,
    FilterGroupContainer,
  },

  dataInputViews: presetDataInputSpecs,
} satisfies uiSpec;
