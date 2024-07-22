import { isSameType } from "@fn-sphere/core";
import { useContext, type ComponentType } from "react";
import { z } from "zod";
import { ViewContext } from "./context.js";
import type { DataInputViewProps, uiSpec } from "./types.js";

export const usePrimitives = <T extends keyof uiSpec["primitives"]>(
  view: T,
) => {
  const specs = useContext(ViewContext);
  return specs.primitives[view];
};

export const useView = <T extends keyof uiSpec["views"]>(view: T) => {
  const specs = useContext(ViewContext);
  return specs.views[view];
};

export const useDataInputView = (
  schema: z.ZodTuple,
): ComponentType<DataInputViewProps> => {
  const specs = useContext(ViewContext);
  const dataInputViews = specs.dataInputViews;
  if (isSameType(schema, z.tuple([z.never()]))) {
    return () => null;
  }
  const targetSpec = dataInputViews.find((spec) => {
    if (typeof spec.match === "function") {
      return spec.match(schema);
    }
    return isSameType(spec.match, schema);
  });
  if (!targetSpec) {
    console.error("no view spec found for", schema, specs);
    return () => (
      <div>
        No view spec found for&nbsp;
        {schema._def.typeName +
          "<" +
          schema.items.map((i) => i._def.typeName).join(", ") +
          ">"}
      </div>
    );
  }
  return targetSpec.view;
};
