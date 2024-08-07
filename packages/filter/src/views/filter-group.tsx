import type { FilterGroup } from "@fn-sphere/core";
import { Fragment } from "react";
import { useFilterGroup } from "../hooks/use-filter-group.js";
import { useRootRule } from "../hooks/use-root-rule.js";
import { useView } from "../theme/hooks.js";

export type FilterGroupProps = {
  rule: FilterGroup;
};

export const FilterGroupView = ({ rule: filterGroup }: FilterGroupProps) => {
  const { appendChildRule, appendChildGroup } = useFilterGroup(filterGroup);
  const { Button: ButtonView } = useView("components");
  const { getLocaleText } = useRootRule();
  const {
    FilterGroupContainer,
    SingleFilter: FilterRuleView,
    RuleJoiner,
  } = useView("templates");
  const count = filterGroup.conditions.length;
  if (count <= 0) {
    return (
      <FilterGroupContainer filterGroup={filterGroup}>
        <ButtonView
          onClick={() => {
            appendChildRule();
          }}
        >
          {getLocaleText("Add Filter")}
        </ButtonView>
        <ButtonView
          onClick={() => {
            appendChildGroup();
          }}
        >
          {getLocaleText("Add Group")}
        </ButtonView>
      </FilterGroupContainer>
    );
  }

  return (
    <FilterGroupContainer filterGroup={filterGroup}>
      {filterGroup.conditions.map((childRule, groupIdx) => {
        if (childRule.type === "Filter") {
          return (
            <Fragment key={childRule.id}>
              {groupIdx > 0 && (
                <RuleJoiner
                  parent={filterGroup}
                  joinBetween={[
                    filterGroup.conditions[groupIdx - 1],
                    childRule,
                  ]}
                />
              )}
              <FilterRuleView rule={childRule} />
            </Fragment>
          );
        }
        return (
          <Fragment key={childRule.id}>
            {groupIdx > 0 && (
              <RuleJoiner
                parent={filterGroup}
                joinBetween={[filterGroup.conditions[groupIdx - 1], childRule]}
              />
            )}
            <FilterGroupView rule={childRule} />
          </Fragment>
        );
      })}
    </FilterGroupContainer>
  );
};
FilterGroupView.displayName = "FilterGroupView";
