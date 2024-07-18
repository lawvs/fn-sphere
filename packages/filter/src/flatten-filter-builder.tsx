import { countNumberOfRules, type LooseFilterGroup } from "@fn-sphere/core";
import { Button } from "@mui/material";
import { Fragment } from "react";
import { FilterRule } from "./filter-rule/index.js";
import { FilterProvider } from "./hooks/filter-provider.js";
import type { BasicFilterProps } from "./types.js";
import { FilterGroupContainer, FilterRuleJoiner } from "./ui.js";
import {
  EMPTY_ROOT_FILTER,
  defaultMapFieldName,
  defaultMapFilterName,
  isFlattenFilterGroup,
} from "./utils.js";

type FilterBuilderProps<Data = unknown> = BasicFilterProps<Data> & {
  rule?: LooseFilterGroup;
  onChange?: (rule: LooseFilterGroup) => void;
};

export const FlattenFilterBuilder = <Data,>({
  schema,
  filterList,
  rule: filterGroup = EMPTY_ROOT_FILTER,
  deepLimit = 1,
  mapFieldName = defaultMapFieldName,
  mapFilterName = defaultMapFilterName,
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
      <div className="filter-builder-container">
        <Button
          variant="contained"
          onClick={() => {
            onChange?.(EMPTY_ROOT_FILTER);
          }}
        >
          Add Filter
        </Button>
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
        deepLimit,
      }}
    >
      <div className="filter-builder-container">
        <FilterGroupContainer isRoot filterGroup={filterGroup}>
          {filterGroup.conditions.map((andGroup, groupIdx) => {
            return (
              <Fragment key={andGroup.id}>
                {groupIdx > 0 && (
                  <FilterRuleJoiner
                    operator={filterGroup.op}
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
                        <FilterRuleJoiner
                          operator={andGroup.op}
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
