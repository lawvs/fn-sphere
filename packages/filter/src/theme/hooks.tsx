import { isSameType } from "@fn-sphere/core";
import { type ComponentType } from "react";
import { z } from "zod";
import { useFilterTheme } from "./context.js";
import type { DataInputViewProps, ThemeSpec } from "./types.js";

/**
 * @deprecated use `useView` instead
 * @internal
 */
export const usePrimitives = <T extends keyof ThemeSpec["primitives"]>(
  view: T,
) => {
  const specs = useFilterTheme();
  return specs.primitives[view];
};

/**
 * Must be used within a `FilterThemeProvider` component.
 */
export const useView = <T extends keyof ThemeSpec>(type: T) => {
  const specs = useFilterTheme();
  return specs[type];
};

/**
 * Must be used within a `FilterThemeProvider` component.
 */
export const useDataInputView = (
  schema?: [] | [z.ZodTypeAny, ...z.ZodTypeAny[]],
): ComponentType<DataInputViewProps> => {
  const dataInputViews = useView("dataInputViews");
  if (!schema) {
    return () => null;
  }
  const targetSpec = dataInputViews.find((spec) => {
    if (typeof spec.match === "function") {
      return spec.match(schema);
    }
    return isSameType(z.tuple(spec.match), z.tuple(schema));
  });
  if (!targetSpec) {
    console.error("no view spec found for", schema, dataInputViews);
    return () => (
      <div>
        No view spec found for&nbsp;
        {"<" + schema.map((i) => i._def.typeName).join(", ") + ">"}
      </div>
    );
  }
  return targetSpec.view;
};
