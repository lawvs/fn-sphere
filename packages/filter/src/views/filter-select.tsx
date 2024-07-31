import type { SingleFilter } from "@fn-sphere/core";
import { useFilterSelect } from "../hooks/use-filter-select.js";
import { useView } from "../specs/index.js";

export type FilterSelectProps = {
  rule: SingleFilter;
};

export const FilterSelect = ({ rule }: FilterSelectProps) => {
  const { Select: SelectView } = useView("components");
  const { selectedField, selectedFilter, filterOptions, updateFilter } =
    useFilterSelect(rule);

  return (
    <SelectView
      value={selectedFilter}
      disabled={!selectedField}
      options={filterOptions}
      onChange={updateFilter}
    />
  );
};
FilterSelect.displayName = "FilterSelect";
