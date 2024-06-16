import {
  countNumberOfRules,
  findFilterField,
  genFilterId,
  type LooseFilterGroup,
  type LooseFilterRule,
} from "@fn-sphere/core";
import Button from "@mui/material/Button";
import type { ReactNode } from "react";
import { FilterRule } from "./filter-rule";
import type { BasicFilterProps } from "./types";
import {
  EMPTY_ROOT_FILTER,
  createEmptyRule,
  defaultMapFieldName,
  defaultMapFilterLabel,
  isFlattenFilterGroup,
} from "./utils";

type FilterBuilderProps<Data = unknown> = BasicFilterProps<Data> & {
  rule?: LooseFilterGroup;
  onChange?: (rule: LooseFilterGroup) => void;
};

const FilterGroupContainer = ({
  filterGroup,
  children,
}: {
  isRoot: boolean;
  filterGroup: LooseFilterGroup;
  children: ReactNode;
}) => {
  // if (isRoot) {
  //   return children;
  // }
  return (
    <div
      className="filter-builder-group-container"
      style={{
        display: "flex",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        {filterGroup.op === "or" ? "Or" : "And"}
      </div>
      <div>{children}</div>
    </div>
  );
};

const FilterRuleJoiner = ({
  operator,
}: {
  operator: LooseFilterGroup["op"];
  joinBetween: [
    LooseFilterRule | LooseFilterGroup,
    LooseFilterRule | LooseFilterGroup,
  ];
}) => {
  return (
    <div
      style={{
        margin: 8,
      }}
    >
      {operator === "or" ? "Or" : "And"}
    </div>
  );
};

export const FlattenFilterBuilder = <Data,>({
  schema,
  filterList,
  rule: filterGroup = EMPTY_ROOT_FILTER,
  deepLimit = 1,
  mapFieldName = defaultMapFieldName,
  mapFilterLabel = defaultMapFilterLabel,
  onChange,
}: FilterBuilderProps<Data>) => {
  const isValidFlattenRule = isFlattenFilterGroup(filterGroup);

  if (!isValidFlattenRule) {
    return (
      <>
        <div>Invalid Rule</div>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            onChange?.(EMPTY_ROOT_FILTER);
          }}
        >
          Reset Filter
        </Button>
      </>
    );
  }

  const count = countNumberOfRules(filterGroup);
  if (count <= 0) {
    return (
      <Button
        variant="contained"
        onClick={() => {
          onChange?.(EMPTY_ROOT_FILTER);
        }}
      >
        Add Filter
      </Button>
    );
  }

  const filterFields = findFilterField({
    schema,
    filterList,
    maxDeep: deepLimit,
  });

  return (
    <div className="filter-builder-container">
      <FilterGroupContainer isRoot filterGroup={filterGroup}>
        {filterGroup.conditions.map((andGroup, groupIdx) => {
          return (
            <>
              {groupIdx > 0 && (
                <FilterRuleJoiner
                  operator={filterGroup.op}
                  joinBetween={[filterGroup.conditions[groupIdx - 1], andGroup]}
                />
              )}
              <FilterGroupContainer isRoot={false} filterGroup={andGroup}>
                <div
                  key={andGroup.id}
                  className="group-container"
                  style={{
                    borderRadius: 4,
                    padding: 4,
                    background: "rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {andGroup.conditions.map((rule, ruleIdx) => (
                    <>
                      {ruleIdx > 0 && (
                        <FilterRuleJoiner
                          operator={andGroup.op}
                          joinBetween={[andGroup.conditions[ruleIdx - 1], rule]}
                        />
                      )}
                      <div key={rule.id} className="rule-container">
                        {
                          <FilterRule
                            rule={rule}
                            filterFields={filterFields}
                            mapFieldName={mapFieldName}
                            mapFilterLabel={mapFilterLabel}
                            onChange={(rule) => {
                              onChange?.({
                                ...filterGroup,
                                conditions: [
                                  ...filterGroup.conditions.slice(0, groupIdx),
                                  {
                                    ...andGroup,
                                    conditions: [
                                      ...andGroup.conditions.slice(0, ruleIdx),
                                      rule,
                                      ...andGroup.conditions.slice(ruleIdx + 1),
                                    ],
                                  },
                                  ...filterGroup.conditions.slice(groupIdx + 1),
                                ],
                              });
                            }}
                            onAddFilter={(operator) => {
                              if (operator === "or") {
                                filterGroup.conditions = [
                                  ...filterGroup.conditions.slice(
                                    0,
                                    groupIdx + 1,
                                  ),
                                  {
                                    id: genFilterId(),
                                    type: "FilterGroup",
                                    op: "and",
                                    conditions: [createEmptyRule()],
                                  },
                                  ...filterGroup.conditions.slice(groupIdx + 1),
                                ];
                                onChange?.({
                                  ...filterGroup,
                                });
                                return;
                              }
                              if (operator === "and") {
                                andGroup.conditions = [
                                  ...andGroup.conditions.slice(0, ruleIdx + 1),
                                  createEmptyRule(),
                                  ...andGroup.conditions.slice(ruleIdx + 1),
                                ];
                                onChange?.({
                                  ...filterGroup,
                                });
                                return;
                              }
                              throw new Error("Invalid operator: " + operator);
                            }}
                            onRemove={() => {
                              if (andGroup.conditions.length === 1) {
                                if (filterGroup.conditions.length === 1) {
                                  // onChange?.(EMPTY_FILTER_GROUP);
                                  onChange?.({
                                    ...filterGroup,
                                    conditions: [],
                                  });
                                  return;
                                }
                                onChange?.({
                                  ...filterGroup,
                                  conditions: [
                                    ...filterGroup.conditions.slice(
                                      0,
                                      groupIdx,
                                    ),
                                    ...filterGroup.conditions.slice(
                                      groupIdx + 1,
                                    ),
                                  ],
                                });
                                return;
                              }
                              onChange?.({
                                ...filterGroup,
                                conditions: [
                                  ...filterGroup.conditions.slice(0, groupIdx),
                                  {
                                    ...andGroup,
                                    conditions: [
                                      ...andGroup.conditions.slice(0, ruleIdx),
                                      ...andGroup.conditions.slice(ruleIdx + 1),
                                    ],
                                  },
                                  ...filterGroup.conditions.slice(groupIdx + 1),
                                ],
                              });
                            }}
                          />
                        }
                      </div>
                    </>
                  ))}
                </div>
              </FilterGroupContainer>
            </>
          );
        })}
      </FilterGroupContainer>
    </div>
  );
};
FlattenFilterBuilder.displayName = "FilterBuilder";
