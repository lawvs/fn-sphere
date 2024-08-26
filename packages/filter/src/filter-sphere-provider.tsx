import { Fragment, type PropsWithChildren } from "react";
import {
  FilterSchemaProvider,
  type FilterSchemaContext,
} from "./hooks/use-filter-schema-context.js";
import { FilterThemeProvider, type FilterTheme } from "./theme/index.js";
export interface FilterSphereProviderProps<Data> {
  context: FilterSchemaContext<Data>;
  theme?: FilterTheme;
}

export const FilterSphereProvider = <Data,>({
  theme,
  context,
  children,
}: PropsWithChildren<FilterSphereProviderProps<Data>>) => {
  const MaybeThemeProviderWithChildren = theme ? (
    <FilterThemeProvider theme={theme}>{children}</FilterThemeProvider>
  ) : (
    <Fragment>{children}</Fragment>
  );

  return (
    <FilterSchemaProvider context={context}>
      {MaybeThemeProviderWithChildren}
    </FilterSchemaProvider>
  );
};
