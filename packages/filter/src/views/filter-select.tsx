import type { SingleFilter } from "@fn-sphere/core";
import {
  useFilterSelect,
  type UpdateFilterOptions,
} from "../hooks/use-filter-select.js";
import { useView } from "../theme/index.js";

export type FilterSelectProps = {
  rule: SingleFilter;
} & UpdateFilterOptions;

export const FilterSelect = ({
  rule,
  ...updateFilterOptions
}: FilterSelectProps) => {
  const { Select: SelectView } = useView("components");
  const { selectedField, selectedFilter, filterOptions, setFilter } =
    useFilterSelect(rule);

  return (
    <SelectView
      value={selectedFilter}
      disabled={!selectedField}
      options={filterOptions}
      onChange={(val) => setFilter(val, updateFilterOptions)}
    />
  );
};
FilterSelect.displayName = "FilterSelect";
