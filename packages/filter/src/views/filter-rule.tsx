import { type SingleFilter } from "@fn-sphere/core";
import { useFilterRule } from "../hooks/use-filter-rule.js";
import { useRootRule } from "../hooks/use-root-rule.js";
import { useView } from "../specs/index.js";
import { createFilterGroup, createSingleFilter } from "../utils.js";

export type SingleFilterRuleProps = {
  rule: SingleFilter;
};

export const SingleFilterView = ({ rule }: SingleFilterRuleProps) => {
  const {
    ruleState: { isValid, isInvert },
    removeRule,
    appendRule,
  } = useFilterRule(rule);
  const { getRootRule, updateRootRule } = useRootRule();
  const { Button: ButtonView } = useView("components");
  const { FieldSelect, FilterSelect, FilterDataInput, SingleFilterContainer } =
    useView("templates");

  return (
    <SingleFilterContainer rule={rule}>
      <FieldSelect rule={rule} />
      {isInvert ? "Not" : null}
      <FilterSelect rule={rule} />
      <FilterDataInput rule={rule} />
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
          rootRule.conditions.push(
            createFilterGroup({
              op: "and",
              conditions: [createSingleFilter()],
            }),
          );
          updateRootRule(rootRule);
        }}
      >
        Or
      </ButtonView>
      <ButtonView aria-label="delete" onClick={() => removeRule(true)}>
        Delete
      </ButtonView>
    </SingleFilterContainer>
  );
};
SingleFilterView.displayName = "SingleFilterView";
