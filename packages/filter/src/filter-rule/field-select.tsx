import type { FilterField, FilterPath, LooseFilterRule } from "@fn-sphere/core";
import { MenuItem, Select } from "@mui/material";

type FieldSelectProps = {
  rule: LooseFilterRule;
  filterableFields: FilterField[];
  mapFieldName: (field: FilterField) => string;
  onChange: (rule: LooseFilterRule) => void;
};

export const FieldSelect = ({
  rule,
  filterableFields,
  mapFieldName,
  onChange,
}: FieldSelectProps) => {
  return (
    <Select
      value={JSON.stringify(rule.path) ?? ""}
      onChange={(e) => {
        const value: FilterPath = JSON.parse(e.target.value);
        onChange({
          ...rule,
          // Clear filter name when field changed
          name: undefined,
          // Reset arguments when field changed
          arguments: [],
          path: value,
        });
      }}
    >
      {filterableFields.map((field) => (
        <MenuItem key={field.path.join(".")} value={JSON.stringify(field.path)}>
          {mapFieldName(field)}
        </MenuItem>
      ))}
    </Select>
  );
};
FieldSelect.displayName = "FieldSelect";
