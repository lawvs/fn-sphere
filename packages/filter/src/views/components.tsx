import {
  useCallback,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
} from "react";
import { usePrimitives } from "../theme/hooks.js";

export const ButtonView = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  const ButtonPrimitive = usePrimitives("button");
  return <ButtonPrimitive {...props} />;
};

export const InputView = ({
  onChange,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  onChange?: (value: string) => void;
}) => {
  const InputPrimitive = usePrimitives("input");
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    },
    [onChange],
  );
  return <InputPrimitive onChange={handleChange} {...props} />;
};

export type SingleSelectProps<T> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange" | "children" | "multiple"
> & {
  value?: T | undefined;
  options?: { value: T; label: string }[] | undefined;
  onChange?: (value: T) => void;
};

export type MultiSelectProps<T> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange" | "children" | "multiple"
> & {
  value?: T[] | undefined;
  options?: { value: T; label: string }[] | undefined;
  onChange?: (value: T[]) => void;
};

export const SingleSelectView = <T,>({
  options = [],
  value,
  onChange,
  ...props
}: SingleSelectProps<T>) => {
  const SelectPrimitive = usePrimitives("select");
  const OptionPrimitive = usePrimitives("option");
  const selectedIdx = options.findIndex((option) => option.value === value);
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const index = Number(e.target.value);
      const selectedOption = options[index];
      if (!selectedOption) return;
      onChange?.(selectedOption.value);
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

export const MultiSelectView = <T,>({
  options = [],
  value = [],
  onChange,
  ...props
}: MultiSelectProps<T>) => {
  const SelectPrimitive = usePrimitives("select");
  const OptionPrimitive = usePrimitives("option");
  const selectedIndices = value.map((val) =>
    String(options.findIndex((option) => option.value === val)),
  );
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => {
        const index = Number(option.value);
        const selectedOption = options[index];
        if (!selectedOption) return;
        return selectedOption.value;
      }).filter((i) => i !== undefined);
      onChange?.(selectedOptions);
    },
    [options, onChange],
  );
  return (
    <SelectPrimitive
      value={selectedIndices}
      onChange={handleChange}
      multiple
      {...props}
    >
      {options.map(({ label }, index) => (
        <OptionPrimitive key={label} value={index}>
          {label}
        </OptionPrimitive>
      ))}
    </SelectPrimitive>
  );
};
