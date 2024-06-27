import {
  getRequiredParameters,
  isEqualPath,
  type FilterField,
  type FilterPath,
  type LooseFilterRule,
  type StandardFnSchema,
} from "@fn-sphere/core";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { defaultMapFieldName, defaultMapFilterName } from "./utils";

export const FilterRule = ({
  rule,
  filterFields,
  mapFieldName = defaultMapFieldName,
  mapFilterName = defaultMapFilterName,
  onChange,
  onAddFilter,
  onRemove,
}: {
  rule: LooseFilterRule;
  filterFields: FilterField[];
  mapFieldName?: (field: FilterField) => string;
  mapFilterName?: (
    filterSchema: StandardFnSchema,
    field: FilterField,
  ) => string;
  onChange: (rule: LooseFilterRule) => void;
  onAddFilter: (operator: "and" | "or") => void;
  onRemove: () => void;
}) => {
  const selectedField = filterFields.find((field) =>
    rule.path ? isEqualPath(field.path, rule.path) : false,
  );
  const selectedFilter = selectedField?.filterList.find(
    (filter) => filter.name === rule.name,
  );
  const requiredArguments = selectedFilter
    ? getRequiredParameters(selectedFilter)
    : undefined;
  return (
    <div>
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
        {filterFields.map((field) => (
          <MenuItem
            key={field.path.join(".")}
            value={JSON.stringify(field.path)}
          >
            {mapFieldName(field)}
          </MenuItem>
        ))}
      </Select>
      {selectedField ? (
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
      ) : (
        <Select value="" disabled placeholder="Select item..." />
      )}
      {/* TODO fix other type */}
      {requiredArguments && requiredArguments.items.length ? (
        <Input
          type="text"
          value={rule.arguments?.[0] ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            onChange({
              ...rule,
              arguments: [value],
            });
            return;
          }}
        />
      ) : requiredArguments && !requiredArguments.items.length ? null : (
        <Input disabled value="" />
      )}
      <Button size="small" onClick={() => onAddFilter("and")}>
        And
      </Button>
      <Button size="small" onClick={() => onAddFilter("or")}>
        Or
      </Button>
      <IconButton aria-label="delete" size="small" onClick={onRemove}>
        <DeleteIcon />
      </IconButton>
    </div>
  );
};
FilterRule.displayName = "FilterRule";
