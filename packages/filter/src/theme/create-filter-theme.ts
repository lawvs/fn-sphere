import { presetTheme } from "./preset.js";
import type { FilterTheme } from "./types.js";

export type FilterThemeInput = {
  dataInputViews?: FilterTheme["dataInputViews"];
  components?: Partial<FilterTheme["components"]>;
  primitives?: Partial<FilterTheme["primitives"]>;
  templates?: Partial<FilterTheme["templates"]>;
};

/**
 * Takes an incomplete theme object and generates a complete theme object
 *
 * The returned `FilterTheme` should be passed to `FilterThemeProvider` or `FilterSphereProvider`
 */
export const createFilterTheme = (theme: FilterThemeInput): FilterTheme => {
  return {
    dataInputViews: [
      ...(theme.dataInputViews ?? []),
      ...presetTheme.dataInputViews,
    ],
    components: { ...presetTheme.components, ...theme.components },
    primitives: { ...presetTheme.primitives, ...theme.primitives },
    templates: { ...presetTheme.templates, ...theme.templates },
  };
};
