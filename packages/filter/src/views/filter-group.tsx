import type { FilterGroup } from "@fn-sphere/core";
import { Fragment } from "react";
import { useView } from "../theme/hooks.js";

export type FilterGroupProps = {
  rule: FilterGroup;
};

export const FilterGroupView = ({ rule: filterGroup }: FilterGroupProps) => {
  const {
    FilterGroupContainer,
    SingleFilter: FilterRuleView,
    RuleJoiner,
  } = useView("templates");

  return (
    <FilterGroupContainer filterGroup={filterGroup}>
      {filterGroup.conditions.map((childRule, groupIdx) => {
        return (
          <Fragment key={childRule.id}>
            {groupIdx > 0 && (
              <RuleJoiner
                parent={filterGroup}
                joinBetween={[filterGroup.conditions[groupIdx - 1]!, childRule]}
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
