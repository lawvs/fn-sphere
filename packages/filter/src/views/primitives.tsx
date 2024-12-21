/* eslint-disable react-refresh/only-export-components */
import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type OptionHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";

const ButtonPrimitive = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button {...props} />;
};

const InputPrimitive = (props: InputHTMLAttributes<HTMLInputElement>) => {
  return <input {...props} />;
};

const SelectPrimitive = (props: SelectHTMLAttributes<HTMLSelectElement>) => {
  return <select {...props} />;
};

const OptionPrimitive = (props: OptionHTMLAttributes<HTMLOptionElement>) => {
  return <option {...props} />;
};

export const primitives = {
  button: ButtonPrimitive,
  input: InputPrimitive,
  select: SelectPrimitive,
  option: OptionPrimitive,
};
