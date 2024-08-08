import { presetTheme } from "./preset.js";
import type { ThemeSpec } from "./types.js";

export type FilterThemeInput = {
  dataInputViews?: ThemeSpec["dataInputViews"];
  components?: Partial<ThemeSpec["components"]>;
  primitives?: Partial<ThemeSpec["primitives"]>;
  templates?: Partial<ThemeSpec["templates"]>;
};

/**
 * Takes an incomplete theme object and generates a complete theme object
 *
 * The returned `ThemeSpec` should be passed to `FilterThemeProvider` or `FilterSphereProvider`
 */
export const createFilterTheme = (theme: FilterThemeInput): ThemeSpec => {
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
