import { countNumberOfRules, type FilterId } from "@fn-sphere/core";
import type {
  BasicFilterSphereInput,
  FilterGroup,
  SingleFilter,
} from "@fn-sphere/filter";
import {
  createFilterGroup,
  createSingleFilter,
  FilterSchemaProvider,
  useFilterSphere,
  useView,
} from "@fn-sphere/filter";
import { Fragment } from "react";

interface FlattenFilterBuilderProps<Data = unknown>
  extends BasicFilterSphereInput<Data> {
  filterRule: FilterGroup;
  onRuleChange?: (rule: FilterGroup) => void;
}

export type FlattenFilterGroup = {
  id: FilterId;
  type: "FilterGroup";
  op: "or";
  conditions: {
    id: FilterId;
    type: "FilterGroup";
    op: "and";
    conditions: SingleFilter[];
  }[];
};

const isFlattenFilterGroup = (
  filterGroup: FilterGroup,
): filterGroup is FlattenFilterGroup => {
  if (filterGroup.op === "and") {
    return false;
  }

  return filterGroup.conditions.every(
    (group) =>
      group.type === "FilterGroup" &&
      group.op === "and" &&
      group.conditions.every((rule) => rule.type === "Filter"),
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const createFlattenFilterGroup = () =>
  createFilterGroup({
    op: "or",
    conditions: [
      createFilterGroup({
        op: "and",
        conditions: [createSingleFilter()],
      }),
    ],
  });

export const FlattenFilterBuilder = <Data,>({
  filterRule,
  ...props
}: FlattenFilterBuilderProps<Data>) => {
  const { context } = useFilterSphere({
    ruleValue: filterRule,
    ...props,
  });
  const {
    RuleJoiner,
    FilterGroupContainer,
    SingleFilter: FilterRule,
  } = useView("templates");
  const { Button: ButtonView } = useView("components");
  const isValidFlattenRule = isFlattenFilterGroup(filterRule);

  if (!isValidFlattenRule) {
    return (
      <FilterGroupContainer isRoot filterGroup={filterRule}>
        <div>Invalid Rule</div>
        <ButtonView
          onClick={() => {
            props.onRuleChange?.(createFlattenFilterGroup());
          }}
        >
          Reset Filter
        </ButtonView>
      </FilterGroupContainer>
    );
  }

  const count = countNumberOfRules(filterRule);
  if (count <= 0) {
    return (
      <FilterGroupContainer isRoot filterGroup={filterRule}>
        <ButtonView
          onClick={() => {
            props.onRuleChange?.(createFlattenFilterGroup());
          }}
        >
          Add Filter
        </ButtonView>
      </FilterGroupContainer>
    );
  }

  return (
    <FilterSchemaProvider value={context}>
      <FilterGroupContainer isRoot filterGroup={filterRule}>
        {filterRule.conditions.map((andGroup, groupIdx) => {
          return (
            <Fragment key={andGroup.id}>
              {groupIdx > 0 && (
                <RuleJoiner
                  parent={filterRule}
                  joinBetween={[filterRule.conditions[groupIdx - 1], andGroup]}
                />
              )}
              <FilterGroupContainer isRoot={false} filterGroup={andGroup}>
                {andGroup.conditions.map((rule, ruleIdx) => (
                  <Fragment key={rule.id}>
                    {ruleIdx > 0 && (
                      <RuleJoiner
                        parent={andGroup}
                        joinBetween={[andGroup.conditions[ruleIdx - 1], rule]}
                      />
                    )}
                    <FilterRule rule={rule} />
                  </Fragment>
                ))}
              </FilterGroupContainer>
            </Fragment>
          );
        })}
      </FilterGroupContainer>
    </FilterSchemaProvider>
  );
};
FlattenFilterBuilder.displayName = "FlattenFilterBuilder";
