import type { SingleFilter } from "@fn-sphere/core";
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
  tryRetainArgs,
  ...props
}: FilterSelectProps) => {
  const { Select: SelectView } = useView("components");
  const { selectedField, selectedFilter, filterOptions, setFilter } =
    useFilterSelect(rule);

  return (
    <SelectView
      value={selectedFilter}
      disabled={!selectedField}
      options={filterOptions}
      onChange={(val) =>
        setFilter(val, {
          tryRetainArgs: !!tryRetainArgs,
        })
      }
      {...props}
    />
  );
};
FilterSelect.displayName = "FilterSelect";
