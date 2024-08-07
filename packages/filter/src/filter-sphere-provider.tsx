import { Fragment, type PropsWithChildren } from "react";
import {
  FilterSchemaProvider,
  type FilterSchemaContext,
} from "./hooks/use-filter-schema-context.js";
import {
  FilterThemeProvider,
  presetTheme,
  type ThemeSpec,
} from "./theme/index.js";

export type FilterThemeInput = {
  dataInputViews?: ThemeSpec["dataInputViews"];
  components?: Partial<ThemeSpec["components"]>;
  primitives?: Partial<ThemeSpec["primitives"]>;
  templates?: Partial<ThemeSpec["templates"]>;
};

export interface FilterSphereProviderProps<Data> {
  context: FilterSchemaContext<Data>;
  theme?: FilterThemeInput;
}

export const FilterSphereProvider = <Data,>({
  theme,
  context,
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
    <FilterSchemaProvider context={context}>
      {MaybeThemeProviderWithChildren}
    </FilterSchemaProvider>
  );
};
