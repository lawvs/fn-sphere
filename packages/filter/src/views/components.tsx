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

export type SelectProps<T> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange" | "children"
> & {
  value?: T | undefined;
  options?: { value: T; label: string }[] | undefined;
  onChange?: (value: T) => void;
};

const SelectViewWithoutRef = <T,>(
  { options = [], value, onChange, ...props }: SelectProps<T>,
  ref?: Ref<HTMLSelectElement>,
) => {
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
};

export const SelectView = forwardRef(SelectViewWithoutRef) as <T>(
  p: SelectProps<T> & { ref?: Ref<HTMLSelectElement> },
) => ReactNode;
