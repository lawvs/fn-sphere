import {
  isEqualPath,
  type FilterField,
  type LooseFilterRule,
  type StandardFnSchema,
} from "@fn-sphere/core";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { defaultMapFieldName, defaultMapFilterName } from "../utils";
import { FieldSelect } from "./field-select";
import { FilterDataInput } from "./filter-data-input";
import { FilterSelect } from "./filter-select";

type FilterRuleProps = {
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
};

export const FilterRule = ({
  rule,
  filterFields,
  mapFieldName = defaultMapFieldName,
  mapFilterName = defaultMapFilterName,
  onChange,
  onAddFilter,
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
