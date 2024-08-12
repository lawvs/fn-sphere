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

export type SelectProps<T> = SingleSelectProps<T> | MultiSelectProps<T>;

type SingleSelectProps<T> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange" | "children"
> & {
  multiple?: false | undefined;
  value?: T | undefined;
  options?: { value: T; label: string }[] | undefined;
  onChange?: (value: T) => void;
};

type MultiSelectProps<T> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange" | "children"
> & {
  multiple: true;
  value?: T[] | undefined;
  options?: { value: T; label: string }[] | undefined;
  onChange?: (value: T[]) => void;
};

const MultiSelectView = forwardRef<
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
});

const SingleSelectView = forwardRef<
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
});

export const SelectView = forwardRef<HTMLSelectElement, SelectProps<unknown>>(
  (props, ref) => {
    if (props.multiple) {
      return <MultiSelectView ref={ref} {...props} />;
    }
    return <SingleSelectView ref={ref} {...props} />;
  },
) as <T>(p: SelectProps<T> & { ref?: Ref<HTMLSelectElement> }) => ReactNode;
