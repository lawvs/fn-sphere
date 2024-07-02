import { isSameType } from "@fn-sphere/core";
import { useContext } from "react";
import type { z } from "zod";
import { ViewContext } from "./context";

export const usePlaceholderView = () => {
  const specs = useContext(ViewContext);
  const placeholderSpec = specs.find((spec) => spec.name === "placeholder");
  if (!placeholderSpec) {
    console.error("no placeholder view found", specs);
    return <div>No placeholder view found</div>;
  }
  return placeholderSpec.view;
};

export const useFilterView = (schema: z.ZodTypeAny) => {
  const specs = useContext(ViewContext);
  const targetSpec = specs.find((spec) => {
    if (!spec.match) {
      // placeholder view
      return false;
    }
    if (typeof spec.match === "function") {
      return spec.match(schema);
    }
    return isSameType(spec.match, schema);
  });
  if (!targetSpec) {
    console.error("no view spec found for", schema, specs);
    return <div>No view spec found for {schema._def.typeName}</div>;
  }
  return targetSpec.view;
};
