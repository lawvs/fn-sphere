import * as SelectPrimitive from "@radix-ui/react-select";
import {
  type ReactNode,
  type RefAttributes,
  useCallback,
  useId,
  useMemo,
} from "react";

import { cn } from "../../../mocks";

import Label from "../label";

type Node = NonNullable<ReactNode>;

interface SelectEventTarget<TValue extends string> {
  name: string;
  value: TValue;
}

export interface SelectOnChangeEvent<TValue extends string = string> {
  target: SelectEventTarget<TValue>;
}

export interface SelectOption<
  TValue extends string = string,
  TName extends Node = Node,
> {
  name: TName;
  value: TValue;
}

export interface SelectProperties<
  TValue extends string = string,
  TName extends Node = Node,
> extends Omit<SelectPrimitive.SelectProps, "onValueChange" | "children">,
    RefAttributes<HTMLButtonElement> {
  className?: string;
  classButton?: string;
  classArrow?: string;
  classOptions?: string;
  classOption?: string;
  id: string;
  name: string;
  label?: string;
  placeholder?: string;
  options: SelectOption<TValue, TName>[];
  size?: "small" | "medium" | "large";
  error?: boolean | string;
  onChange?: (event: SelectOnChangeEvent<TValue>) => void; // for support react-hook-form
}

export default function Select<
  TValue extends string = string,
  TName extends Node = Node,
>(properties: Readonly<SelectProperties<TValue, TName>>) {
  const {
    className,
    classButton,
    classArrow,
    classOptions,
    classOption,
    ref,
    id,
    name,
    label,
    placeholder,
    options,
    size = "large",
    error,
    value,
    onChange,
    ...others
  } = properties;

  const dynamicId = useId();
  const realId = useMemo(() => `${id}-${dynamicId}`, [id, dynamicId]);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const handleValueChange = useCallback(
    (value: TValue) => onChange?.({ target: { name, value } }),
    [name, onChange],
  );

  return (
    <fieldset className={cn("block", className)}>
      {label ? (
        <Label className="mb-3" htmlFor={realId}>
          {label}
        </Label>
      ) : null}

      <SelectPrimitive.Root
        {...others}
        name={name}
        {...(value !== undefined ? { value } : {})}
        onValueChange={handleValueChange}
      >
        <SelectPrimitive.Trigger
          ref={ref}
          aria-label={label ?? name}
          id={realId}
          className={cn(
            "group inline-flex w-full items-center justify-between outline-none transition-colors",
            "rounded-sm border border-n-1 bg-white font-bold text-n-1 tap-highlight-color",
            "data-[placeholder]:text-n-2 radix-state-open:border-red-1",
            "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
            size === "large" && "h-16 px-5 text-sm",
            size === "medium" && "h-10 px-3 text-sm",
            size === "small" && "h-6 px-4 text-xs",
            error ? "border-pink-1" : "",
            classButton,
          )}
        >
          {/**
           * We cannot use the SelectPrimitive.Value component here, as it will cause a bug (see below).
           * We need to handle the selected option and placeholder manually.
           * Due to the inability to use SelectPrimitive.Value, this may have some impact on accessibility.
           */}
          <span className="pointer-events-none truncate">
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <SelectPrimitive.Icon
            className={cn(
              "icon-[material-symbols--keyboard-arrow-down] pointer-events-none text-xl leading-none",
              "shrink-0 transition-transform group-radix-state-open:rotate-180",
              size === "large" && "-mr-0.5 ml-6",
              size === "medium" && "-mr-1 ml-4",
              size === "small" && "-mr-2 ml-2",
              classArrow,
            )}
          />
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            className={cn(
              "my-1 max-h-96 min-w-[var(--radix-popper-anchor-width)] overflow-hidden",
              "rounded-sm border border-n-3 bg-white shadow-lg",
            )}
          >
            <SelectPrimitive.Viewport
              className={cn(
                "h-[var(--radix-select-trigger-height)] w-full",
                size === "large" && "p-2",
                size === "medium" && "p-1",
                size === "small" && "p-0",
                classOptions,
              )}
            >
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    "flex cursor-pointer items-start outline-none transition-colors tap-highlight-color",
                    "min-h-6 rounded-sm font-bold text-n-3 hover:text-n-1",
                    "radix-state-checked:bg-n-3/20 radix-state-checked:text-n-1",
                    size === "large" && "px-3 py-2 text-sm",
                    size === "medium" && "px-2 py-1.5 text-sm",
                    size === "small" && "py-1 pl-4 text-xs",
                    classOption,
                  )}
                >
                  <SelectPrimitive.ItemText asChild>
                    {/**
                     * There is a bug in the Radix UI Select component, it will crash if user use Chrome or Safari built-in translation feature.
                     * TODO(550): Keep track of the issue and remove this workaround when the issue is fixed.
                     * See: https://github.com/radix-ui/primitives/issues/2578
                     * Use a span to wrap the text to avoid the crash, this is a workaround.
                     * See: https://github.com/radix-ui/primitives/issues/2578#issuecomment-1890801041
                     * Google attempt to fix this issue: https://groups.google.com/a/chromium.org/g/blink-dev/c/L1aI9JZTrBs/m/8HqhILBoDQAJ
                     * Other helpful links: https://stackoverflow.com/a/22934552
                     */}
                    <span className="w-full">{option.name}</span>
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {error && typeof error === "string" ? (
        <div className="mt-1 text-xs text-pink-1">{error}</div>
      ) : null}
    </fieldset>
  );
}
