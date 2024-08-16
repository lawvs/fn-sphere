import {
  forwardRef,
  useCallback,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
} from "react";
import { usePrimitives } from "../theme/hooks.js";

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

export const SingleSelectView = forwardRef<
  HTMLSelectElement,
  SingleSelectProps<unknown>
>(({ options = [], value, onChange, ...props }, ref) => {
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
    <SelectPrimitive
      ref={ref}
      value={selectedIdx}
      onChange={handleChange}
      {...props}
    >
      <OptionPrimitive key={-1} value={-1} disabled></OptionPrimitive>
      {options.map(({ label }, index) => (
        <OptionPrimitive key={label} value={index}>
          {label}
        </OptionPrimitive>
      ))}
    </SelectPrimitive>
  );
}) as <T>(
  p: SingleSelectProps<T> & { ref?: Ref<HTMLSelectElement> },
) => ReactNode;

export const MultiSelectView = forwardRef<
  HTMLSelectElement,
  MultiSelectProps<unknown>
>(({ options = [], value = [], onChange, ...props }, ref) => {
  const SelectPrimitive = usePrimitives("select");
  const OptionPrimitive = usePrimitives("option");
  const selectedIndices = value.map((val) =>
    String(options.findIndex((option) => option.value === val)),
  );
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const selectedOptions = Array.from(
        e.target.selectedOptions,
        (option) => options[Number(option.value)].value,
      );
      onChange?.(selectedOptions);
    },
    [options, onChange],
  );
  return (
    <SelectPrimitive
      ref={ref}
      value={selectedIndices}
      onChange={handleChange}
      {...props}
    >
      {options.map(({ label }, index) => (
        <OptionPrimitive key={label} value={index}>
          {label}
        </OptionPrimitive>
      ))}
    </SelectPrimitive>
  );
}) as <T>(
  p: MultiSelectProps<T> & { ref?: Ref<HTMLSelectElement> },
) => ReactNode;
