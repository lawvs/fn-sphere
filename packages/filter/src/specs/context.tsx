import { createContext, type ReactNode } from "react";
import { presetView } from "./preset";
import type { ViewSpec } from "./types";

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
