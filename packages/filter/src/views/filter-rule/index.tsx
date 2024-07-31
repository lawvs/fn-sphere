import { type SingleFilter } from "@fn-sphere/core";
import { useFilterRule } from "../../hooks/use-filter-rule.js";
import { useRootRule } from "../../hooks/use-root-rule.js";
import { useView } from "../../specs/index.js";
import { createEmptyFilterGroup } from "../../utils.js";
import { FilterDataInput } from "./filter-data-input.js";

type SingleFilterRuleProps = {
  rule: SingleFilter;
};

export const SingleFilterView = ({ rule }: SingleFilterRuleProps) => {
  const {
    ruleState: { isValid, isInvert },
    selectedFilter,
    updateRule,
    removeRule,
    appendRule,
  } = useFilterRule(rule);
  const { getRootRule, updateRootRule } = useRootRule();
  const { Button: ButtonView } = useView("components");
  const { FieldSelect, FilterSelect } = useView("templates");

  return (
    <div>
      <FieldSelect rule={rule} />
      {isInvert ? "Not" : null}
      <FilterSelect rule={rule} />

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
SingleFilterView.displayName = "SingleFilterView";
