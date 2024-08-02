import { createContext, useContext, type ReactNode } from "react";
import { presetTheme } from "./preset.js";
import type { ThemeSpec } from "./types.js";

const FilterThemeContext = createContext<ThemeSpec>(presetTheme);

/**
 * @internal
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useFilterTheme = () => {
  return useContext(FilterThemeContext);
};

export const FilterThemeProvider = ({
  theme,
  children,
}: {
  theme: ThemeSpec;
  children?: ReactNode;
}) => {
  return (
    <FilterThemeContext.Provider value={theme}>
      {children}
    </FilterThemeContext.Provider>
  );
};
