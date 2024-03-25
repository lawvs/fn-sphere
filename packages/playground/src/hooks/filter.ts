import { createContext, createElement, useContext } from "react";
import type { ZodType } from "zod";
import {
  createFilterGroup,
  createFilterSphere,
  type FieldFilter,
  type FilterGroup,
  type FnSchema,
  type GenericFnSchema,
} from "fn-sphere";
import { createContextState } from "./misc";

const FlexFilterContext = createContext<ReturnType<
  typeof createFilterSphere
> | null>(null);

export const FlexFilterProvider = <T>({
  schema,
  filterList,
  children,
}: {
  schema: ZodType<T>;
  filterList: (FnSchema | GenericFnSchema)[];
  children: React.ReactNode;
}) => {
  return createElement(
    FlexFilterContext.Provider,
    {
      value: createFilterSphere<T>(schema, filterList),
    },
    children,
  );
};

export const useFilterableField = (maxDeep = 1) => {
  const flexFilter = useContext(FlexFilterContext);
  if (!flexFilter) {
    throw new Error(
      "useFilterableField must be used within a `FilterProvider`",
    );
  }
  return flexFilter.findFilterableField({ maxDeep });
};

export const [FilterRuleProvide, useRootFilterRule, useSetRootFilterRule] =
  createContextState<FilterGroup>(createFilterGroup("and", []));

export const useFilter = () => {
  const filterSphere = useContext(FlexFilterContext);
  if (!filterSphere) {
    throw new Error(
      "useFilterableField must be used within a `FilterProvider`",
    );
  }
  const rootFilter = useRootFilterRule();
  const setRootFilter = useSetRootFilterRule();
  const update = () => {
    const newRootFilter = { ...rootFilter };
    setRootFilter(newRootFilter);
  };

  // For inspect
  console.log("filter", rootFilter);

  return {
    toggleFilterMode: (filterGroup = rootFilter) => {
      filterGroup.op = filterGroup.op === "and" ? "or" : "and";
      update();
      return filterGroup.op;
    },
    addFilter: (filter: FilterGroup | FieldFilter, parent: FilterGroup) => {
      parent.conditions.push(filter);
      update();
    },
    addFilterGroup: (op: "and" | "or", parent: FilterGroup) => {
      const newGroup = filterSphere.createFilterGroup(op, []);
      parent.conditions = [...parent.conditions, newGroup];
      update();
    },
    updateFilter: (
      oldFilter: FilterGroup | FieldFilter,
      newFilter: FilterGroup | FieldFilter,
      parent: FilterGroup,
    ) => {
      parent.conditions = parent.conditions.map((i) =>
        i === oldFilter ? newFilter : i,
      );
      update();
    },
    removeFilter: (filter: FilterGroup | FieldFilter, parent: FilterGroup) => {
      if (filter === rootFilter) {
        throw new Error("Cannot remove root filter");
      }
      parent.conditions = parent.conditions.filter((i) => i !== filter);
      update();
    },
    inputFilter: (filter: FieldFilter, value: unknown[]) => {
      filter.input(...value);
      update();
    },
    filterData: <T>(data: T[]): T[] => {
      return filterSphere.filterData(data, rootFilter);
    },
  };
};
