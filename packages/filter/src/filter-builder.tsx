import { FilterSchemaProvider } from "./hooks/use-filter-schema-context.js";
import { useView } from "./theme/hooks.js";
import type { ThemeSpec } from "./theme/index.js";
import { FilterThemeProvider, presetTheme } from "./theme/index.js";
import type { BasicFilterSphereInput } from "./types.js";

interface FilterBuilderProps<Data> extends BasicFilterSphereInput<Data> {
  theme: {
    dataInputViews?: ThemeSpec["dataInputViews"];
    components?: Partial<ThemeSpec["components"]>;
    primitives?: Partial<ThemeSpec["primitives"]>;
    templates?: Partial<ThemeSpec["templates"]>;
  };
}

export const FilterBuilder = <Data,>({
  schema,
  filterList,
  filterRule,
  onRuleChange,
  mapFieldName,
  mapFilterName,
  fieldDeepLimit,
  theme,
}: FilterBuilderProps<Data>) => {
  const { FilterGroup } = useView("templates");

  const normalizedSchema = {
    dataInputViews: [
      ...(theme.dataInputViews ?? []),
      ...presetTheme.dataInputViews,
    ],
    components: { ...presetTheme.components, ...theme.components },
    primitives: { ...presetTheme.primitives, ...theme.primitives },
    templates: { ...presetTheme.templates, ...theme.templates },
  } satisfies ThemeSpec;

  return (
    <FilterThemeProvider spec={normalizedSchema}>
      <FilterSchemaProvider
        value={{
          schema,
          filterList,
          filterRule: filterRule,
          onRuleChange,
          mapFieldName,
          mapFilterName,
          fieldDeepLimit,
        }}
      >
        <FilterGroup rule={filterRule} />
      </FilterSchemaProvider>
    </FilterThemeProvider>
  );
};
