import { isSameType } from "@fn-sphere/core";
import { type ComponentType } from "react";
import { $ZodTuple, type $ZodType } from "zod/v4/core";
import { useFilterTheme } from "./context.js";
import type { DataInputViewProps, FilterTheme } from "./types.js";

/**
 * @deprecated use `useView` instead
 * @internal
 */
export const usePrimitives = <T extends keyof FilterTheme["primitives"]>(
  view: T,
) => {
  const specs = useFilterTheme();
  return specs.primitives[view];
};

/**
 * Must be used within a `FilterThemeProvider` component.
 */
export const useView = <T extends keyof FilterTheme>(type: T) => {
  const specs = useFilterTheme();
  return specs[type];
};

/**
 * Must be used within a `FilterThemeProvider` component.
 */
export const useDataInputView = (
  fnParamsSchema?: $ZodTuple,
  fieldSchema?: $ZodType,
): ComponentType<DataInputViewProps> => {
  const dataInputViews = useView("dataInputViews");
  if (!fnParamsSchema) {
    return () => null;
  }
  const targetSpec = dataInputViews.find((spec) => {
    if (typeof spec.match === "function") {
      return spec.match(fnParamsSchema, fieldSchema);
    }
    if (Array.isArray(spec.match)) {
      return isSameType(
        new $ZodTuple({
          type: "tuple",
          items: spec.match,
          rest: null,
        }),
        fnParamsSchema,
      );
    }
    return isSameType(spec.match, fnParamsSchema);
  });
  if (!targetSpec) {
    console.error("no view spec found for", fnParamsSchema, dataInputViews);
    return () => (
      <div>
        No view spec found for&nbsp;
        {"<" +
          fnParamsSchema._zod.def.items.map((i) => i._zod.def.type).join(", ") +
          ">"}
      </div>
    );
  }
  return targetSpec.view;
};
