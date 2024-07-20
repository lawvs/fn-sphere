import { type LooseFilterRule } from "@fn-sphere/core";
import { Delete as DeleteIcon, Error as ErrorIcon } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { useFilterRule } from "../hooks/use-filter-rule.js";
import { useRootRule } from "../hooks/use-root-rule.js";
import { createEmptyFilterGroup } from "../utils.js";
import { FieldSelect } from "./field-select.js";
import { FilterDataInput } from "./filter-data-input.js";
import { FilterSelect } from "./filter-select.js";

type FilterRuleProps = {
  rule: LooseFilterRule;
};

export const FilterRule = ({ rule }: FilterRuleProps) => {
  const {
    ruleState: { isValid },
    filterableFields,
    selectedField,
    selectedFilter,
    updateRule,
    removeRule,
    appendRule,
  } = useFilterRule(rule);
  const { mapFieldName, mapFilterName, getRootRule, updateRootRule } =
    useRootRule();

  return (
    <div>
      <FieldSelect
        rule={rule}
        filterableFields={filterableFields}
        mapFieldName={mapFieldName}
        onChange={updateRule}
      />
      <FilterSelect
        selectedField={selectedField}
        selectedFilter={selectedFilter}
        rule={rule}
        mapFilterName={mapFilterName}
        onChange={updateRule}
      />
      <FilterDataInput
        rule={rule}
        filterSchema={selectedFilter}
        onChange={updateRule}
      />

      {isValid ? null : <ErrorIcon />}
      <Button
        size="small"
        onClick={() => {
          appendRule();
        }}
      >
        And
      </Button>
      <Button
        size="small"
        onClick={() => {
          const rootRule = getRootRule();
          rootRule.conditions.push(createEmptyFilterGroup("and"));
          updateRootRule(rootRule);
        }}
      >
        Or
      </Button>
      <IconButton
        aria-label="delete"
        size="small"
        onClick={() => removeRule(true)}
      >
        <DeleteIcon />
      </IconButton>
    </div>
  );
};
FilterRule.displayName = "FilterRule";
