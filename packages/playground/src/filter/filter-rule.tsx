import {
  createFilterGroup,
  createSingleFilter,
  type SingleFilter,
} from "@fn-sphere/core";
import { useFilterRule, useRootRule, useView } from "@fn-sphere/filter";

type FlattenSingleFilterRuleProps = {
  rule: SingleFilter;
};

export const FlattenSingleFilterView = ({
  rule,
}: FlattenSingleFilterRuleProps) => {
  const {
    ruleState: { isValid, isInvert },
    removeRule,
    appendRule,
  } = useFilterRule(rule);
  const { getLocaleText, getRootRule, updateRootRule } = useRootRule();
  const { Button: ButtonView } = useView("components");
  const { FieldSelect, FilterSelect, FilterDataInput, SingleFilterContainer } =
    useView("templates");

  return (
    <SingleFilterContainer rule={rule}>
      <FieldSelect rule={rule} />
      {isInvert ? getLocaleText("Not") : null}
      <FilterSelect rule={rule} />
      <FilterDataInput rule={rule} />
      {isValid ? null : "!"}
      <ButtonView
        onClick={() => {
          appendRule();
        }}
      >
        {getLocaleText("And")}
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
        {getLocaleText("Or")}
      </ButtonView>
      <ButtonView aria-label="delete" onClick={() => removeRule(true)}>
        {getLocaleText("Delete")}
      </ButtonView>
    </SingleFilterContainer>
  );
};
FlattenSingleFilterView.displayName = "FlattenSingleFilterView";
