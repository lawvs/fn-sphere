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
      {isInvert ? getLocaleText("Not") : null}
      <FilterSelect rule={rule} />
      <FilterDataInput rule={rule} />
      {/* {isValid ? null : "!"} */}
      <ButtonView aria-label="delete" onClick={() => removeRule(true)}>
        {getLocaleText("Delete")}
      </ButtonView>
    </SingleFilterContainer>
  );
};
SingleFilterView.displayName = "SingleFilterView";
