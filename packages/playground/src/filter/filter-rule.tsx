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
  const { rootRule, getLocaleText, updateRootRule } = useRootRule();
  const { Button: ButtonView } = useView("components");
  const { FieldSelect, FilterSelect, FilterDataInput, SingleFilterContainer } =
    useView("templates");

  return (
    <SingleFilterContainer rule={rule}>
      <FieldSelect rule={rule} />
      {isInvert ? getLocaleText("operatorNot") : null}
      <FilterSelect rule={rule} />
      <FilterDataInput rule={rule} />
      {isValid ? null : "!"}
      <ButtonView
        onClick={() => {
          appendRule();
        }}
      >
        {getLocaleText("operatorAnd")}
      </ButtonView>
      <ButtonView
        onClick={() => {
          rootRule.conditions.push(
            createFilterGroup({
              op: "and",
              conditions: [createSingleFilter()],
            }),
          );
          updateRootRule(rootRule);
        }}
      >
        {getLocaleText("operatorOr")}
      </ButtonView>
      <ButtonView onClick={() => removeRule(true)}>
        {getLocaleText("deleteRule")}
      </ButtonView>
    </SingleFilterContainer>
  );
};
FlattenSingleFilterView.displayName = "FlattenSingleFilterView";
