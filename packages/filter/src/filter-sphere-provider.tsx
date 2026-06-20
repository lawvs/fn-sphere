import { type PropsWithChildren } from "react";
import {
  FilterSchemaProvider,
  type FilterSchemaContext,
} from "./hooks/use-filter-schema-context.js";
import { FilterThemeProvider } from "./theme/context.js";
import { presetTheme } from "./theme/preset.js";
import type { FilterTheme } from "./theme/types.js";

export interface FilterSphereProviderProps<Data> {
  context: FilterSchemaContext<Data>;
  theme?: FilterTheme;
}

export const FilterSphereProvider = <Data,>({
  theme,
  context,
  children,
}: PropsWithChildren<FilterSphereProviderProps<Data>>) => {
  return (
    <FilterSchemaProvider context={context}>
      <FilterThemeProvider theme={theme ?? presetTheme}>
        {children}
      </FilterThemeProvider>
    </FilterSchemaProvider>
  );
};
