import { type LooseFilterRule } from "@fn-sphere/core";
import { Delete as DeleteIcon, Error as ErrorIcon } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { useFilterRule } from "../hooks/use-filter-rule.js";
import { useRootRule } from "../hooks/use-root-rule.js";
import { useView } from "../specs/index.js";
import { createEmptyFilterGroup } from "../utils.js";
import { FilterDataInput } from "./filter-data-input.js";

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
  const SelectView = useView("Select");

  console.log("FilterRule", rule.path);
  return (
    <div>
      <SelectView
        value={JSON.stringify(rule.path)}
        options={filterableFields.map((field) => ({
          value: JSON.stringify(field.path),
          label: mapFieldName(field),
        }))}
        onChange={(pathStr) => {
          updateRule({
            ...rule,
            // Clear filter name when field changed
            name: undefined,
            // Reset arguments when field changed
            arguments: [],
            path: JSON.parse(pathStr),
          });
        }}
      />

      <SelectView
        value={selectedFilter?.name}
        disabled={!selectedField}
        options={selectedField?.filterList.map((filter) => ({
          label: mapFilterName(filter, selectedField),
          value: filter.name,
        }))}
        onChange={(value) => {
          updateRule({
            ...rule,
            name: value,
          });
        }}
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
