import { createContext, type ReactNode } from "react";
import { presetSpec } from "./preset.js";
import type { uiSpec } from "./types.js";

export const ViewContext = createContext<uiSpec>(presetSpec);

export const FilterViewProvider = ({
  specs,
  children,
}: {
  specs: uiSpec;
  children: ReactNode;
}) => {
  return <ViewContext.Provider value={specs}>{children}</ViewContext.Provider>;
};
