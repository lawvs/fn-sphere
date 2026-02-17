import { createContext, useContext, type ReactNode } from "react";
import { presetTheme } from "./preset.js";
import type { FilterTheme } from "./types.js";

const FilterThemeContext = createContext<FilterTheme>(presetTheme);

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
export function FilterThemeProvider({
  theme,
  children,
}: {
  theme: FilterTheme;
  children?: ReactNode;
}) {
  return (
    // eslint-disable-next-line @eslint-react/no-context-provider -- Compatibility with React 18 and earlier versions
    <FilterThemeContext.Provider value={theme}>
      {children}
    </FilterThemeContext.Provider>
  );
}
