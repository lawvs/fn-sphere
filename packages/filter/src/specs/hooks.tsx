import { isSameType } from "@fn-sphere/core";
import { useContext, type ComponentType } from "react";
import { z } from "zod";
import { ViewContext } from "./context";
import type { DataInputViewProps } from "./types";

export const usePlaceholderView = () => {
  const specs = useContext(ViewContext);
  const placeholderView = specs.dataInputPlaceholder;
  return placeholderView;
};

export const useInputView = () => {
  const specs = useContext(ViewContext);
  const inputView = specs.input;
  return inputView;
};

export const useDataInputView = (
  schema: z.ZodTuple,
): ComponentType<DataInputViewProps> => {
  const specs = useContext(ViewContext);
  if (isSameType(schema, z.tuple([z.never()]))) {
    return () => null;
  }
  const targetSpec = specs.dataInputViews.find((spec) => {
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
