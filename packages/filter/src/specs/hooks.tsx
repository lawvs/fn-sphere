import { isSameType } from "@fn-sphere/core";
import { useContext, type ComponentType } from "react";
import { z } from "zod";
import { UiSpecContext } from "./context.js";
import type { DataInputViewProps, UiSpec } from "./types.js";

const useUiSpec = () => {
  return useContext(UiSpecContext);
};

/**
 * @deprecated use `useView` instead
 */
export const usePrimitives = <T extends keyof UiSpec["primitives"]>(
  view: T,
) => {
  const specs = useUiSpec();
  return specs.primitives[view];
};

export const useView = <T extends keyof UiSpec>(type: T) => {
  const specs = useUiSpec();
  return specs[type];
};

export const useDataInputView = (
  schema?: [] | [z.ZodTypeAny, ...z.ZodTypeAny[]],
): ComponentType<DataInputViewProps> => {
  const specs = useUiSpec();
  const dataInputViews = specs.dataInputViews;
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
    console.error("no view spec found for", schema, specs);
    return () => (
      <div>
        No view spec found for&nbsp;
        {"<" + schema.map((i) => i._def.typeName).join(", ") + ">"}
      </div>
    );
  }
  return targetSpec.view;
};
