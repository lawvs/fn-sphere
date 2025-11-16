import { createFilterTheme } from "@fn-sphere/filter";
import { useCallback, useId, useMemo } from "react";

import { cn } from "../../mocks";

import Select, { type SelectOnChangeEvent } from "../inputs/select";

const fallbackArray = [] as const;
export const themeSpec = createFilterTheme({
  primitives: {
    button: ({ className, ...properties }) => {
      return (
        <button
          className={cn(
            "inline-flex h-8 items-center justify-center px-3 text-xs font-bold text-black transition-colors",
            "border border-black rounded-sm fill-black hover:bg-black hover:text-white hover:fill-white",
            className,
          )}
          type="button"
          {...properties}
        />
      );
    },
    input: ({ className, ...properties }) => {
      return (
        <input
          className={cn(
            "w-full rounded-sm border border-black bg-transparent p-2 text-xs font-bold text-black",
            "outline-none transition-colors placeholder:text-black focus:border-[#E44C55]",
            // Hide the spinner in number input
            // https://stackoverflow.com/questions/3790935/can-i-hide-the-html5-number-input-s-spin-box
            "[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
            className,
          )}
          {...properties}
        />
      );
    },
  },
  components: {
    // eslint-disable-next-line @eslint-react/prefer-read-only-props -- Props from the library
    Select: ({ value, options = fallbackArray, onChange }) => {
      const id = useId();
      const selectedIndex = useMemo(
        () => String(options.findIndex((option) => option.value === value)),
        [options, value],
      );
      const normalizedOptions = useMemo(
        () =>
          options.map((option, index) => ({
            value: index.toString(),
            name: option.label,
          })),
        [options],
      );
      const handleChange = useCallback(
        (event: SelectOnChangeEvent) => {
          const index = Number(event.target.value);
          const selectedOption = options[index];
          if (!selectedOption) return;
          onChange?.(selectedOption.value);
        },
        [options, onChange],
      );

      return (
        <Select
          classArrow="-mr-1"
          classButton="h-auto px-2 py-1.5"
          classOptions="space-y-1"
          id={id}
          name="filter-select"
          options={normalizedOptions}
          size="small"
          value={selectedIndex}
          onChange={handleChange}
        />
      );
    },
  },
});
