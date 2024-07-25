import type { LooseFilterGroup } from "@fn-sphere/core";
import { FilterProvider } from "./hooks/filter-provider.js";
import { useView } from "./specs/hooks.js";
import type { BasicFilterProps } from "./types.js";

export const FilterBuilder = <Data,>({
  schema,
  filterList,
  rule,
  onRuleChange,
  mapFieldName,
  mapFilterName,
  deepLimit,
}: {
  rule: LooseFilterGroup;
  onRuleChange?: (rule: LooseFilterGroup) => void;
} & BasicFilterProps<Data>) => {
  const FilterGroup = useView("FilterGroup");
  return (
    <FilterProvider
      value={{
        schema,
        filterList,
        filterRule: rule,
        onRuleChange,

        mapFieldName,
        mapFilterName,
        deepLimit,
      }}
    >
      <FilterGroup rule={rule} />
    </FilterProvider>
  );
};
