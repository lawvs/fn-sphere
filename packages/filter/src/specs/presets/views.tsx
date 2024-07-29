import type { LooseFilterGroup, LooseFilterRule } from "@fn-sphere/core";
import {
  forwardRef,
  useCallback,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { usePrimitives } from "../hooks.js";
import { useView } from "../index.js";
import type { SelectProps } from "../types.js";

export const ButtonView = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  const ButtonPrimitive = usePrimitives("button");
  return <ButtonPrimitive ref={ref} {...props} />;
});

export const InputView = forwardRef<
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

export const SelectView = <T,>({
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
      <OptionPrimitive key={-1} value={-1} disabled></OptionPrimitive>
      {options.map(({ label }, index) => (
        <OptionPrimitive key={label} value={index}>
          {label}
        </OptionPrimitive>
      ))}
    </SelectPrimitive>
  );
};

export const DataInputPlaceholder = forwardRef<HTMLInputElement>((_, ref) => {
  const InputView = useView("Input");
  return <InputView ref={ref} disabled />;
});

export const RuleJoiner = ({
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

export const FilterGroupContainer = ({
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
