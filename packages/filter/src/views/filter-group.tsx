import type { FilterGroup } from "@fn-sphere/core";
import { Fragment } from "react";
import { useFilterGroup } from "../hooks/use-filter-group.js";
import { useView } from "../specs/hooks.js";

export const FilterGroupView = ({
  rule: filterGroup,
}: {
  rule: FilterGroup;
}) => {
  const {
    ruleState: { isRoot },
    appendChildRule,
    appendChildGroup,
  } = useFilterGroup(filterGroup);
  const { Button: ButtonView } = useView("components");
  const {
    FilterGroupContainer,
    SingleFilter: FilterRuleView,
    RuleJoiner,
  } = useView("templates");
  const count = filterGroup.conditions.length;
  if (count <= 0) {
    return (
      <div className="filter-builder-container">
        <ButtonView
          onClick={() => {
            appendChildRule();
          }}
        >
          Add Filter
        </ButtonView>
        <ButtonView
          onClick={() => {
            appendChildGroup();
          }}
        >
          Add Group
        </ButtonView>
      </div>
    );
  }

  return (
    <div className="filter-builder-container">
      <FilterGroupContainer isRoot={isRoot} filterGroup={filterGroup}>
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
                  joinBetween={[
                    filterGroup.conditions[groupIdx - 1],
                    childRule,
                  ]}
                />
              )}
              <FilterGroupView rule={childRule} />
            </Fragment>
          );
        })}
      </FilterGroupContainer>
    </div>
  );
};
FilterGroupView.displayName = "FilterGroupView";
