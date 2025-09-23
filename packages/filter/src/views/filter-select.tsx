import type { SingleFilter, StandardFnSchema } from "@fn-sphere/core";
import { useCallback } from "react";
import {
  useFilterSelect,
  type UpdateFilterOptions,
} from "../hooks/use-filter-select.js";
import { useView } from "../theme/index.js";
import type { CommonProps } from "./types.js";

export type FilterSelectProps = {
  rule: SingleFilter;
} & UpdateFilterOptions &
  CommonProps;

export const FilterSelect = ({
  rule,
  tryRetainArgs = true,
  ...props
}: FilterSelectProps) => {
  const { Select: SelectView } = useView("components");
  const { selectedField, selectedFilter, filterOptions, setFilter } =
    useFilterSelect(rule);

  const handleChange = useCallback(
    (val: StandardFnSchema) =>
      setFilter(val, {
        tryRetainArgs: !!tryRetainArgs,
      }),
    [setFilter, tryRetainArgs],
  );

  return (
    <SelectView
      value={selectedFilter}
      disabled={!selectedField}
      options={filterOptions}
      onChange={handleChange}
      {...props}
    />
  );
};
FilterSelect.displayName = "FilterSelect";
