import { countNumberOfRules } from "@fn-sphere/core";
import { Fragment } from "react";
import { FilterSchemaProvider } from "./hooks/use-filter-schema-context.js";
import { useView } from "./theme/index.js";
import type { BasicFilterSphereInput } from "./types.js";
import {
  createFilterGroup,
  createSingleFilter,
  defaultMapFieldName,
  defaultMapFilterName,
  isFlattenFilterGroup,
} from "./utils.js";

type FilterBuilderProps<Data = unknown> = BasicFilterSphereInput<Data>;

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
  filterRule: filterGroup = createFlattenFilterGroup(),
  fieldDeepLimit = 1,
  mapFieldName = defaultMapFieldName,
  mapFilterName = defaultMapFilterName,
  onRuleChange,
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
      <FilterGroupContainer isRoot filterGroup={filterGroup}>
        <div>Invalid Rule</div>
        <ButtonView
          onClick={() => {
            onRuleChange?.(createFlattenFilterGroup());
          }}
        >
          Reset Filter
        </ButtonView>
      </FilterGroupContainer>
    );
  }

  const count = countNumberOfRules(filterGroup);
  if (count <= 0) {
    return (
      <FilterGroupContainer isRoot filterGroup={filterGroup}>
        <ButtonView
          onClick={() => {
            onRuleChange?.(createFlattenFilterGroup());
          }}
        >
          Add Filter
        </ButtonView>
      </FilterGroupContainer>
    );
  }

  return (
    <FilterSchemaProvider
      value={{
        schema,
        filterList,
        filterRule: filterGroup,
        onRuleChange,

        mapFieldName,
        mapFilterName,
        fieldDeepLimit,
      }}
    >
      <FilterGroupContainer isRoot filterGroup={filterGroup}>
        {filterGroup.conditions.map((andGroup, groupIdx) => {
          return (
            <Fragment key={andGroup.id}>
              {groupIdx > 0 && (
                <RuleJoiner
                  parent={filterGroup}
                  joinBetween={[filterGroup.conditions[groupIdx - 1], andGroup]}
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
    </FilterSchemaProvider>
  );
};
FlattenFilterBuilder.displayName = "FlattenFilterBuilder";
