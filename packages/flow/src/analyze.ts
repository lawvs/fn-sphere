import type { StandardFnSchema } from "@fn-sphere/core";
import { inspectFlow } from "./inspect.js";
import type { FlowSpec } from "./schema.js";
import type { FlowAnalysis } from "./types.js";

type AnalyzeFlowOptions = {
  flow: FlowSpec;
  fnList: readonly StandardFnSchema[];
};

export const analyzeFlow = (options: AnalyzeFlowOptions): FlowAnalysis => {
  const inspected = inspectFlow(options);
  return {
    valid: inspected.valid,
    diagnostics: inspected.diagnostics,
  };
};
