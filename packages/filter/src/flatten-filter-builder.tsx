import { countNumberOfRules, type LooseFilterGroup } from "@fn-sphere/core";
import { Button } from "@mui/material";
import { Fragment } from "react";
import { FilterProvider } from "./hooks/filter-provider.js";
import { useView } from "./specs/index.js";
import type { BasicFilterProps } from "./types.js";
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
  const RuleJoiner = useView("RuleJoiner");
  const FilterGroupContainer = useView("FilterGroupContainer");
  const FilterRule = useView("FilterRule");
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
