import type { FilterGroup } from "@fn-sphere/core";
import { FilterProvider } from "./hooks/filter-provider.js";
import { useView } from "./specs/hooks.js";
import type { UiSpec } from "./specs/index.js";
import { FilterUiProvider, presetUiSpec } from "./specs/index.js";
import type { BasicFilterBuilderProps } from "./types.js";

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
    views?: Partial<UiSpec["components"]>;
    primitives?: Partial<UiSpec["primitives"]>;
    templates?: Partial<UiSpec["templates"]>;
  };
} & BasicFilterBuilderProps<Data>) => {
  const { FilterGroup } = useView("templates");

  const normalizedSchema = {
    dataInputViews: [
      ...(uiSpec.dataInputViews ?? []),
      ...presetUiSpec.dataInputViews,
    ],
    components: { ...presetUiSpec.components, ...uiSpec.views },
    primitives: { ...presetUiSpec.primitives, ...uiSpec.primitives },
    templates: { ...presetUiSpec.templates, ...uiSpec.templates },
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
