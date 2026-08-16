import type { StandardFnSchema } from "@fn-sphere/core";
import type { $ZodFunction } from "zod/v4/core";
import type { FlowSpec } from "./schema.js";

export type FlowSchema<T extends $ZodFunction = $ZodFunction> = Omit<
  StandardFnSchema<T>,
  "implement"
> & {
  flow: FlowSpec;
};

export type FlowDiagnosticCode =
  | "duplicate-node-id"
  | "duplicate-edge-id"
  | "duplicate-function-name"
  | "missing-input-node"
  | "multiple-input-nodes"
  | "missing-output-node"
  | "multiple-output-nodes"
  | "unsupported-function-input"
  | "unknown-function"
  | "unknown-source-node"
  | "unknown-target-node"
  | "invalid-source-handle"
  | "invalid-target-handle"
  | "multiple-input-edges"
  | "missing-input-edge"
  | "incompatible-edge"
  | "cycle";

export type FlowDiagnostic = {
  code: FlowDiagnosticCode;
  message: string;
  nodeId?: string;
  edgeId?: string;
  handle?: number;
};

export type FlowAnalysis = {
  valid: boolean;
  diagnostics: FlowDiagnostic[];
};
