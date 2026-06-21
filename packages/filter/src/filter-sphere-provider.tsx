import { type PropsWithChildren } from "react";
import {
  FilterSchemaProvider,
  type FilterSchemaContext,
} from "./hooks/use-filter-schema-context.js";
import {
  FilterThemeProvider,
  useOptionalFilterTheme,
} from "./theme/context.js";
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
  const inheritedTheme = useOptionalFilterTheme();
  const resolvedTheme = theme ?? inheritedTheme ?? presetTheme;

  return (
    <FilterSchemaProvider context={context}>
      <FilterThemeProvider theme={resolvedTheme}>
        {children}
      </FilterThemeProvider>
    </FilterSchemaProvider>
  );
};
