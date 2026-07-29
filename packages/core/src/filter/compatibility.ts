import { isCompatibleType } from "zod-compare";
import type {
  $ZodNullable,
  $ZodOptional,
  $ZodType,
  $ZodUnion,
} from "zod/v4/core";

const unwrapNullish = (schema: $ZodType) => {
  let current = schema;
  while (
    current._zod.def.type === "optional" ||
    current._zod.def.type === "nullable"
  ) {
    current = (current as $ZodOptional | $ZodNullable)._zod.def.innerType;
  }
  return current;
};

const acceptsArbitraryValues = (schema: $ZodType) => {
  const baseSchema = unwrapNullish(schema);
  if (
    baseSchema._zod.def.type === "any" ||
    baseSchema._zod.def.type === "unknown"
  ) {
    return true;
  }
  if (baseSchema._zod.def.type === "union") {
    return (baseSchema as $ZodUnion)._zod.def.options.some(
      acceptsArbitraryValues,
    );
  }
  return false;
};

export const doesFilterAcceptField = (
  filterParameter: $ZodType,
  fieldSchema: $ZodType,
) => {
  if (acceptsArbitraryValues(fieldSchema)) {
    return acceptsArbitraryValues(filterParameter);
  }
  if (acceptsArbitraryValues(filterParameter)) {
    return true;
  }
  return isCompatibleType(filterParameter, fieldSchema);
};
