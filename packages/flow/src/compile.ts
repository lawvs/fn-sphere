import type { StandardFnSchema } from "@fn-sphere/core";
import { z } from "zod";
import type {
  $ZodFunction,
  $ZodTuple,
  $ZodType,
  $ZodUnknown,
} from "zod/v4/core";
import { inspectFlow, type ExecutableFlow } from "./inspection/inspect.js";
import type { FlowEdgeSpec, FlowSpec } from "./schema.js";
import type { FlowDiagnostic } from "./types.js";

type CompileFlowOptions = {
  flow: FlowSpec;
  fnList: readonly StandardFnSchema[];
};

type RuntimeFn = (...args: unknown[]) => unknown;
type CompiledFlowFunction = $ZodFunction<$ZodTuple<[], $ZodUnknown>, $ZodType>;

export type TryCompileFlowResult =
  | { valid: false; diagnostics: FlowDiagnostic[] }
  | {
      valid: true;
      diagnostics: FlowDiagnostic[];
      compiled: StandardFnSchema<CompiledFlowFunction>;
    };

const implementFn = (fnSchema: StandardFnSchema): RuntimeFn =>
  fnSchema.skipValidate
    ? (fnSchema.implement as RuntimeFn)
    : (fnSchema.define.implement(fnSchema.implement) as RuntimeFn);

export function compileFlow(
  options: CompileFlowOptions,
): StandardFnSchema<CompiledFlowFunction> {
  const result = tryCompileFlow(options);
  if (!result.valid) {
    const codes = [
      ...new Set(
        result.diagnostics
          .filter((diagnostic) => diagnostic.severity === "error")
          .map((diagnostic) => diagnostic.code),
      ),
    ];
    throw new Error(`Cannot compile invalid flow: ${codes.join(", ")}`);
  }

  return result.compiled;
}

export function tryCompileFlow(
  options: CompileFlowOptions,
): TryCompileFlowResult {
  const inspected = inspectFlow(options);
  if (!inspected.valid) {
    return inspected;
  }
  return {
    valid: true,
    diagnostics: inspected.diagnostics,
    compiled: compileExecutable(inspected.executable),
  };
}

function compileExecutable(
  executable: ExecutableFlow,
): StandardFnSchema<CompiledFlowFunction> {
  const nodes = executable.nodes.map((node) => ({
    ...node,
    implement: implementFn(node.fn),
  }));

  const resolveSource = (
    edge: FlowEdgeSpec,
    args: unknown[],
    results: Map<string, unknown>,
  ) => {
    if (edge.source === executable.inputNodeId) {
      return args[edge.sourceHandle];
    }
    return results.get(edge.source);
  };

  const implement = (...args: unknown[]) => {
    const results = new Map<string, unknown>();
    for (const node of nodes) {
      const nodeArgs = node.inputEdges.map((edge) =>
        resolveSource(edge, args, results),
      );
      results.set(node.id, node.implement(...nodeArgs));
    }
    return resolveSource(executable.outputEdge, args, results);
  };

  const define = z.function({
    input: executable.inputSchemas,
    output: executable.outputSchema,
  }) as unknown as CompiledFlowFunction;

  return {
    name: executable.name,
    define,
    implement,
  };
}
