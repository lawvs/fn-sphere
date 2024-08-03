import { Fragment, type PropsWithChildren } from "react";
import { FilterSchemaProvider } from "./hooks/use-filter-schema-context.js";
import {
  FilterThemeProvider,
  presetTheme,
  type ThemeSpec,
} from "./theme/index.js";
import type { BasicFilterSphereInput } from "./types.js";

export type FilterThemeInput = {
  dataInputViews?: ThemeSpec["dataInputViews"];
  components?: Partial<ThemeSpec["components"]>;
  primitives?: Partial<ThemeSpec["primitives"]>;
  templates?: Partial<ThemeSpec["templates"]>;
};

export interface FilterSphereProviderProps<Data>
  extends BasicFilterSphereInput<Data> {
  theme?: FilterThemeInput;
}

export const FilterSphereProvider = <Data,>({
  schema,
  filterFnList,
  filterRule,
  onRuleChange,
  mapFieldName,
  mapFilterName,
  fieldDeepLimit,
  theme,
  children,
}: PropsWithChildren<FilterSphereProviderProps<Data>>) => {
  const MaybeThemeProviderWithChildren = theme ? (
    <FilterThemeProvider
      theme={{
        dataInputViews: [
          ...(theme.dataInputViews ?? []),
          ...presetTheme.dataInputViews,
        ],
        components: { ...presetTheme.components, ...theme.components },
        primitives: { ...presetTheme.primitives, ...theme.primitives },
        templates: { ...presetTheme.templates, ...theme.templates },
      }}
    >
      {children}
    </FilterThemeProvider>
  ) : (
    <Fragment>{children}</Fragment>
  );

  return (
    <FilterSchemaProvider
      value={{
        schema,
        filterFnList,
        filterRule,
        onRuleChange,
        mapFieldName,
        mapFilterName,
        fieldDeepLimit,
      }}
    >
      {MaybeThemeProviderWithChildren}
    </FilterSchemaProvider>
  );
};
