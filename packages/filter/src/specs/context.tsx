import { createContext, type ReactNode } from "react";
import { presetUiSpec } from "../preset.js";
import type { UiSpec } from "./types.js";

export const UiSpecContext = createContext<UiSpec>(presetUiSpec);

export const FilterUiProvider = ({
  spec,
  children,
}: {
  spec: UiSpec;
  children: ReactNode;
}) => {
  return (
    <UiSpecContext.Provider value={spec}>{children}</UiSpecContext.Provider>
  );
};
