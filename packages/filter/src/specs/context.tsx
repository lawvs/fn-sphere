import { createContext, type ReactNode } from "react";
import { presetViewSpecs } from "./preset";
import type { ViewSpec } from "./types";

export const ViewContext = createContext<ViewSpec[]>(presetViewSpecs);

export const FilterViewProvider = ({
  specs,
  children,
}: {
  specs: ViewSpec[];
  children: ReactNode;
}) => {
  return <ViewContext.Provider value={specs}>{children}</ViewContext.Provider>;
};
