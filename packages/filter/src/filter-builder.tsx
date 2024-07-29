import type { FilterGroup } from "@fn-sphere/core";
import { FilterProvider } from "./hooks/filter-provider.js";
import { useView } from "./specs/hooks.js";
import { FilterUiProvider, presetUiSpec } from "./specs/index.js";
import type { UiSpec } from "./specs/types.js";
import type { BasicFilterProps } from "./types.js";

export const FilterBuilder = <Data,>({
  schema,
  filterList,
  rule,
  onRuleChange,
  mapFieldName,
  mapFilterName,
  deepLimit,
  uiSpec,
}: {
  rule: FilterGroup;
  onRuleChange?: (rule: FilterGroup) => void;
  uiSpec: {
    dataInputViews?: UiSpec["dataInputViews"];
    views?: Partial<UiSpec["views"]>;
    primitives?: Partial<UiSpec["primitives"]>;
  };
} & BasicFilterProps<Data>) => {
  const FilterGroup = useView("FilterGroup");

  const normalizedSchema = {
    dataInputViews: [
      ...(uiSpec.dataInputViews ?? []),
      ...presetUiSpec.dataInputViews,
    ],
    views: { ...presetUiSpec.views, ...uiSpec.views },
    primitives: { ...presetUiSpec.primitives, ...uiSpec.primitives },
  } satisfies UiSpec;

  return (
    <FilterUiProvider spec={normalizedSchema}>
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
    </FilterUiProvider>
  );
};
