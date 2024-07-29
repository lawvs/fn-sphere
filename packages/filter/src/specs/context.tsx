import { createContext, type ReactNode } from "react";
import { presetUiSpec } from "./presets/index.js";
import type { UiSpec } from "./types.js";

export const ViewContext = createContext<UiSpec>(presetUiSpec);

export const FilterUiProvider = ({
  spec,
  children,
}: {
  spec: UiSpec;
  children: ReactNode;
}) => {
  return <ViewContext.Provider value={spec}>{children}</ViewContext.Provider>;
};
