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

/**
 * This component takes a theme prop and applies it to the children.
 *
 * It should preferably be used at the root of your filter component tree.
 */
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
