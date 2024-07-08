import { createContext, type ReactNode } from "react";
import { presetView } from "./preset.js";
import type { ViewSpec } from "./types.js";

export const ViewContext = createContext<ViewSpec>(presetView);

export const FilterViewProvider = ({
  specs,
  children,
}: {
  specs: ViewSpec;
  children: ReactNode;
}) => {
  return <ViewContext.Provider value={specs}>{children}</ViewContext.Provider>;
};
