import { type LooseFilterRule } from "@fn-sphere/core";
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
  const ButtonView = useView("Button");

  return (
    <div>
      <SelectView
        value={selectedField}
        options={filterableFields.map((field) => ({
          value: field,
          label: mapFieldName(field),
        }))}
        onChange={(newField) => {
          updateRule({
            ...rule,
            // Clear filter name when field changed
            name: undefined,
            // name: newField.filterList[0].name,
            // Reset arguments when field changed
            arguments: [],
            path: newField.path,
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

      {isValid ? null : "!"}
      <ButtonView
        onClick={() => {
          appendRule();
        }}
      >
        And
      </ButtonView>
      <ButtonView
        onClick={() => {
          const rootRule = getRootRule();
          rootRule.conditions.push(createEmptyFilterGroup("and"));
          updateRootRule(rootRule);
        }}
      >
        Or
      </ButtonView>
      <ButtonView aria-label="delete" onClick={() => removeRule(true)}>
        Delete
      </ButtonView>
    </div>
  );
};
FilterRule.displayName = "FilterRule";
