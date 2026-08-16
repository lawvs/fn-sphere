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
  | "multiple-input-consumers"
  | "multiple-input-edges"
  | "missing-input-edge"
  | "unresolved-input-schema"
  | "incompatible-edge"
  | "cycle"
  | "unreachable-node";

export type FlowDiagnosticSeverity = "error" | "warning";

export type FlowDiagnostic = {
  severity: FlowDiagnosticSeverity;
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
