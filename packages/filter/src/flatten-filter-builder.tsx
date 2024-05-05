import {
  countNumberOfRules,
  findFilterField,
  genFilterId,
} from "@fn-sphere/core";
import Button from "@mui/material/Button";
import { FilterRule } from "./filter-rule";
import type { FilterBuilderProps } from "./types";
import { EMPTY_ROOT_FILTER, createEmptyRule } from "./utils";

export const FilterBuilder = <Data,>({
  schema,
  filterList,
  defaultRule: filterGroup = EMPTY_ROOT_FILTER,
  deepLimit = 1,
  onChange,
}: FilterBuilderProps<Data>) => {
  const filterFields = findFilterField({
    schema,
    filterList,
    maxDeep: deepLimit,
  });
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
  return (
    <div className="filter-builder-container">
      {filterGroup.conditions.map((andGroup, groupIdx) => {
        return (
          <div
            key={andGroup.id}
            className="group-container"
            style={{
              marginBottom: 8,
              borderRadius: 4,
              padding: 4,
              background: "rgba(0, 0, 0, 0.05)",
            }}
          >
            {groupIdx > 0 && (
              <div>{filterGroup.op === "or" ? "Or" : "And"}</div>
            )}
            {andGroup.conditions.map((rule, ruleIdx) => (
              <div key={rule.id} className="rule-container">
                {ruleIdx > 0 && (
                  <div>{andGroup.op === "and" ? "And" : "Or"}</div>
                )}
                {
                  <FilterRule
                    rule={rule}
                    filterFields={filterFields}
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
                          ...filterGroup.conditions.slice(0, groupIdx + 1),
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
                            ...filterGroup.conditions.slice(0, groupIdx),
                            ...filterGroup.conditions.slice(groupIdx + 1),
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
            ))}
          </div>
        );
      })}
    </div>
  );
};
FilterBuilder.displayName = "FilterBuilder";
