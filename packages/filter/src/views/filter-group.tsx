import type { FilterGroup } from "@fn-sphere/core";
import { Fragment } from "react";
import { useView } from "../theme/hooks.js";
import type { CommonProps } from "./types.js";

export type FilterGroupProps = {
  rule: FilterGroup;
} & CommonProps;

export const FilterGroupView = ({ rule, ...props }: FilterGroupProps) => {
  const {
    FilterGroupContainer,
    SingleFilter: FilterRuleView,
    RuleJoiner,
  } = useView("templates");

  return (
    <FilterGroupContainer rule={rule} {...props}>
      {rule.conditions.map((childRule, groupIdx) => {
        return (
          <Fragment key={childRule.id}>
            {groupIdx > 0 && (
              <RuleJoiner
                parent={rule}
                joinBetween={[rule.conditions[groupIdx - 1]!, childRule]}
              />
            )}
            {childRule.type === "Filter" ? (
              <FilterRuleView rule={childRule} />
            ) : (
              <FilterGroupView rule={childRule} />
            )}
          </Fragment>
        );
      })}
    </FilterGroupContainer>
  );
};
FilterGroupView.displayName = "FilterGroupView";
