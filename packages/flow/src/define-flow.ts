import type { $ZodFunction } from "zod/v4/core";
import type { FlowSchema } from "./types.js";

export function defineFlow<T extends $ZodFunction>(
  schema: FlowSchema<T>,
): FlowSchema<T> {
  return schema;
}
