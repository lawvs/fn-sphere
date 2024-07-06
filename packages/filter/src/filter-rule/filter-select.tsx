import type {
  FilterField,
  LooseFilterRule,
  StandardFnSchema,
} from "@fn-sphere/core";
import { MenuItem, Select } from "@mui/material";

type FieldSelectProps = {
  selectedField?: FilterField;
  selectedFilter?: StandardFnSchema;
  rule: LooseFilterRule;
  onChange: (rule: LooseFilterRule) => void;
  mapFilterName: (filterSchema: StandardFnSchema, field: FilterField) => string;
};

export const FilterSelect = ({
  selectedField,
  selectedFilter,
  rule,
  mapFilterName,
  onChange,
}: FieldSelectProps) => {
  if (!selectedField) {
    return <Select value="" disabled placeholder="Select item..." />;
  }
  return (
    <Select
      value={selectedFilter?.name ?? ""}
      onChange={(e) => {
        const value = e.target.value;
        onChange({
          ...rule,
          name: value,
          // TODO check if arguments are compatible with the filter
        });
      }}
    >
      {selectedField.filterList.map((filter) => (
        <MenuItem key={filter.name} value={filter.name}>
          {mapFilterName(filter, selectedField)}
        </MenuItem>
      ))}
    </Select>
  );
};
FilterSelect.displayName = "FilterSelect";
