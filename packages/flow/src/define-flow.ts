import type { $ZodFunction } from "zod/v4/core";
import type { FlowDefinition } from "./types.js";

export function defineFlow<T extends $ZodFunction>(
  definition: FlowDefinition<T>,
): FlowDefinition<T> {
  return definition;
}
