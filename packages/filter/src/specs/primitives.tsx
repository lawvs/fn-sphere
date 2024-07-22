/* eslint-disable react-refresh/only-export-components */
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type OptionHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";

const ButtonPrimitive = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  return <button ref={ref} {...props} />;
});

const InputPrimitive = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  return <input ref={ref} {...props} />;
});

const SelectPrimitive = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ ...props }, ref) => {
  return <select ref={ref} {...props} />;
});

const OptionPrimitive = forwardRef<
  HTMLOptionElement,
  OptionHTMLAttributes<HTMLOptionElement>
>(({ ...props }, ref) => {
  return <option ref={ref} {...props} />;
});

export const primitives = {
  button: ButtonPrimitive,
  input: InputPrimitive,
  select: SelectPrimitive,
  option: OptionPrimitive,
};
