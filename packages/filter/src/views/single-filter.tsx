import { type SingleFilter } from "@fn-sphere/core";
import { useFilterRule } from "../hooks/use-filter-rule.js";
import { useRootRule } from "../hooks/use-root-rule.js";
import { useView } from "../theme/index.js";

export type SingleFilterRuleProps = {
  rule: SingleFilter;
};

export const SingleFilterView = ({ rule }: SingleFilterRuleProps) => {
  const {
    ruleState: { isInvert },
    removeRule,
  } = useFilterRule(rule);
  const { getLocaleText } = useRootRule();
  const { Button: ButtonView } = useView("components");
  const { FieldSelect, FilterSelect, FilterDataInput, SingleFilterContainer } =
    useView("templates");

  return (
    <SingleFilterContainer rule={rule}>
      <FieldSelect rule={rule} />
      {isInvert ? getLocaleText("operatorNot") : null}
      <FilterSelect rule={rule} />
      <FilterDataInput rule={rule} />
      {/* {isValid ? null : "!"} */}
      <ButtonView onClick={() => removeRule(true)}>
        {getLocaleText("deleteRule")}
      </ButtonView>
    </SingleFilterContainer>
  );
};
SingleFilterView.displayName = "SingleFilterView";
