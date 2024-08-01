import { countNumberOfRules, type FilterGroup } from "@fn-sphere/core";
import { Fragment } from "react";
import { FilterProvider } from "./hooks/use-filter-builder-context.js";
import { useView } from "./specs/index.js";
import type { BasicFilterBuilderProps } from "./types.js";
import {
  createFilterGroup,
createSingleFilter,
  defaultMapFieldName,
  defaultMapFilterName,
  isFlattenFilterGroup,
} from "./utils.js";

type FilterBuilderProps<Data = unknown> = BasicFilterBuilderProps<Data> & {
  rule?: FilterGroup;
  onChange?: (rule: FilterGroup) => void;
};

const createFlattenFilterGroup = () =>
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
  schema,
  filterList,
  rule: filterGroup = createFlattenFilterGroup(),
  fieldDeepLimit = 1,
  mapFieldName = defaultMapFieldName,
  mapFilterName = defaultMapFilterName,
  onChange,
}: FilterBuilderProps<Data>) => {
  const {
    RuleJoiner,
    FilterGroupContainer,
    SingleFilter: FilterRule,
  } = useView("templates");
  const { Button: ButtonView } = useView("components");
  const isValidFlattenRule = isFlattenFilterGroup(filterGroup);

  if (!isValidFlattenRule) {
    return (
      <>
        <div>Invalid Rule</div>
        <ButtonView
          onClick={() => {
            onChange?.(createFlattenFilterGroup());
          }}
        >
          Reset Filter
        </ButtonView>
      </>
    );
  }

  const count = countNumberOfRules(filterGroup);
  if (count <= 0) {
    return (
      <div className="filter-builder-container">
        <ButtonView
          onClick={() => {
            onChange?.(createFlattenFilterGroup());
          }}
        >
          Add Filter
        </ButtonView>
      </div>
    );
  }

  return (
    <FilterProvider
      value={{
        schema,
        filterList,
        filterRule: filterGroup,
        onRuleChange: onChange,

        mapFieldName,
        mapFilterName,
        fieldDeepLimit,
      }}
    >
      <div className="filter-builder-container">
        <FilterGroupContainer isRoot filterGroup={filterGroup}>
          {filterGroup.conditions.map((andGroup, groupIdx) => {
            return (
              <Fragment key={andGroup.id}>
                {groupIdx > 0 && (
                  <RuleJoiner
                    parent={filterGroup}
                    joinBetween={[
                      filterGroup.conditions[groupIdx - 1],
                      andGroup,
                    ]}
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
                      <div className="rule-container">
                        {<FilterRule rule={rule} />}
                      </div>
                    </Fragment>
                  ))}
                </FilterGroupContainer>
              </Fragment>
            );
          })}
        </FilterGroupContainer>
      </div>
    </FilterProvider>
  );
};
FlattenFilterBuilder.displayName = "FlattenFilterBuilder";
