import {
  type FilterGroup,
  type FilterableField,
  type FnSchema,
} from "@fn-sphere/core";
import { useEffect } from "react";
import { CloseIcon } from "tdesign-icons-react";
import { Button } from "tdesign-react";
import type { ZodType } from "zod";
import {
  FilterRuleProvide,
  FlexFilterProvider,
  useFilter,
  useFilterableField,
  useRootFilterRule,
} from "../hooks/filter";
import { AddFilterButton } from "./add-filter-button";
import { SingleRule } from "./single-rule";

export const Filter = <T,>({
  schema,
  filterList,
  onChange,
}: {
  schema: ZodType<T>;
  filterList: FnSchema[];
  onChange?: (cb: {
    rule: FilterGroup;
    filterData: <T>(d: T[]) => T[];
  }) => void;
}) => {
  return (
    <FlexFilterProvider schema={schema} filterList={filterList}>
      <FilterRuleProvide>
        <FilterRoot onChange={onChange} />
      </FilterRuleProvide>
    </FlexFilterProvider>
  );
};

const FilterRoot = ({
  onChange,
}: {
  onChange?: (cb: {
    rule: FilterGroup;
    filterData: <T>(d: T[]) => T[];
  }) => void;
}) => {
  const rootRule = useRootFilterRule();
  const { filterData } = useFilter();

  useEffect(() => {
    onChange?.({ rule: rootRule, filterData });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootRule]);

  return <FilterGroup filterGroup={rootRule} />;
};

const FilterGroup = ({
  filterGroup,
  groupParent,
}: {
  filterGroup: FilterGroup;
  groupParent?: FilterGroup;
}) => {
  const { addFilter, addFilterGroup, toggleFilterMode, removeFilter } =
    useFilter();
  const fields = useFilterableField(Infinity);

  const onAddFilter = (value: FilterableField | undefined) => {
    if (!value) {
      addFilterGroup("and", filterGroup);
      return;
    }
    addFilter(value.filterList[0], filterGroup);
  };

  return (
    <div
      className="filter-rule"
      style={{
        display: "flex",
        flexDirection: "column",
        marginRight: 0,
        padding: 4,
        borderRadius: 4,
        background: "rgba(0, 0, 0, 0.05)",
      }}
    >
      {filterGroup.conditions.map((rule, index) => {
        return (
          <div
            key={index}
            className="rule-wrapper"
            style={{ display: "flex", marginBottom: 8 }}
          >
            {index > 0 && (
              <Button ghost onClick={() => toggleFilterMode(filterGroup)}>
                {filterGroup.op === "and" ? "AND" : "OR"}
              </Button>
            )}
            {rule.type === "Filter" && (
              <SingleRule rule={rule} ruleParent={filterGroup}></SingleRule>
            )}
            {rule.type === "FilterGroup" && (
              <FilterGroup filterGroup={rule} groupParent={filterGroup} />
            )}
          </div>
        );
      })}

      <div>
        <AddFilterButton
          fields={fields}
          onAddFilter={onAddFilter}
        ></AddFilterButton>

        {groupParent && (
          <Button
            shape="round"
            theme="danger"
            variant="text"
            icon={<CloseIcon></CloseIcon>}
            onClick={() => {
              removeFilter(filterGroup, groupParent);
            }}
          />
        )}
      </div>
    </div>
  );
};
