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
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { z, type ZodTuple } from "zod";
import { useDataInputView, usePlaceholderView } from "./specs";
import { defaultMapFieldName, defaultMapFilterName } from "./utils";

const DataInput = ({
  rule,
  inputSchema,
  onChange,
}: {
  rule: LooseFilterRule;
  inputSchema?: ZodTuple;
  onChange: (rule: LooseFilterRule) => void;
}) => {
  const refCallback = () => null;
  const Placeholder = usePlaceholderView();
  const DataInput = useDataInputView(inputSchema ?? z.tuple([z.never()]));
  if (!inputSchema) {
    return <Placeholder ref={refCallback} />;
  }
  if (!inputSchema.items.length) {
    return null;
  }
  return (
    <DataInput
      ref={refCallback}
      rule={rule}
      inputSchema={inputSchema}
      onChange={onChange}
    />
  );
};

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
      <DataInput
        rule={rule}
        inputSchema={requiredArguments}
        onChange={onChange}
      />

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
