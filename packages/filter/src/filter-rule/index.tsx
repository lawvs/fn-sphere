import {
  isEqualPath,
  type FilterField,
  type LooseFilterRule,
  type StandardFnSchema,
} from "@fn-sphere/core";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { defaultMapFieldName, defaultMapFilterName } from "../utils.js";
import { FieldSelect } from "./field-select.js";
import { FilterDataInput } from "./filter-data-input.js";
import { FilterSelect } from "./filter-select.js";

type FilterRuleProps = {
  rule: LooseFilterRule;
  filterFields: FilterField[];
  mapFieldName?: (field: FilterField) => string;
  mapFilterName?: (
    filterSchema: StandardFnSchema,
    field: FilterField,
  ) => string;
  onChange: (rule: LooseFilterRule) => void;
  onAddFilter: () => void;
  onAddGroup: (operator: "and" | "or") => void;
  onRemove: () => void;
};

export const FilterRule = ({
  rule,
  filterFields,
  mapFieldName = defaultMapFieldName,
  mapFilterName = defaultMapFilterName,
  onChange,
  onAddFilter,
  onAddGroup,
  onRemove,
}: FilterRuleProps) => {
  const selectedField = filterFields.find((field) =>
    rule.path ? isEqualPath(field.path, rule.path) : false,
  );
  const selectedFilter = selectedField?.filterList.find(
    (filter) => filter.name === rule.name,
  );

  return (
    <div>
      <FieldSelect
        rule={rule}
        filterFields={filterFields}
        mapFieldName={mapFieldName}
        onChange={onChange}
      />
      <FilterSelect
        selectedField={selectedField}
        selectedFilter={selectedFilter}
        rule={rule}
        mapFilterName={mapFilterName}
        onChange={onChange}
      />
      <FilterDataInput
        rule={rule}
        filterSchema={selectedFilter}
        onChange={onChange}
      />

      <Button size="small" onClick={onAddFilter}>
        And
      </Button>
      <Button size="small" onClick={() => onAddGroup("and")}>
        Or
      </Button>
      <IconButton aria-label="delete" size="small" onClick={onRemove}>
        <DeleteIcon />
      </IconButton>
    </div>
  );
};
FilterRule.displayName = "FilterRule";
