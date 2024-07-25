import type { LooseFilterGroup } from "@fn-sphere/core";
import { Fragment } from "react";
import { useFilterGroup } from "./hooks/use-filter-group.js";
import { useView } from "./specs/hooks.js";

export const FilterGroup = ({
  rule: filterGroup,
}: {
  rule: LooseFilterGroup;
}) => {
  const {
    ruleState: { isRoot },
    appendChildRule,
    appendChildGroup,
  } = useFilterGroup(filterGroup);
  const ButtonView = useView("Button");
  const RuleJoiner = useView("RuleJoiner");
  const FilterGroupContainer = useView("FilterGroupContainer");
  const FilterRuleView = useView("FilterRule");
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
              <FilterGroup rule={childRule} />
            </Fragment>
          );
        })}
      </FilterGroupContainer>
    </div>
  );
};
FilterGroup.displayName = "FilterGroup";
