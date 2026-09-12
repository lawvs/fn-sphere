import type { StandardFnSchema } from "@fn-sphere/core";
import { z } from "zod";
import type { $ZodFunction, $ZodTuple, $ZodType } from "zod/v4/core";
import { inspectFlow, type ExecutableFlow } from "./inspection/inspect.js";
import type { FlowEdgeSpec, FlowSpec } from "./schema.js";
import type { FlowDiagnostic } from "./types.js";

type CompileFlowOptions = {
  flow: FlowSpec;
  fnList: readonly StandardFnSchema[];
};

type RuntimeFn = (...args: unknown[]) => unknown;
type CompiledFlowFunction = $ZodFunction<$ZodTuple, $ZodType>;

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
  const inputCount = executable.inputSchemas.length;
  const outputIndices = new Map(
    executable.nodes.map((node, index) => [node.id, inputCount + index]),
  );
  const sourceIndex = (edge: FlowEdgeSpec) =>
    edge.source === executable.inputNodeId
      ? edge.sourceHandle
      : outputIndices.get(edge.source)!;
  const steps = executable.nodes.map((node) => ({
    run: implementFn(node.fn),
    inputs: node.inputEdges.map(sourceIndex),
  }));
  const outputIndex = sourceIndex(executable.outputEdge);

  const implement = (...values: unknown[]) => {
    // Reserve input positions; node results follow in topological order.
    values.length = inputCount;
    for (const { run, inputs } of steps) {
      values.push(run(...inputs.map((index) => values[index])));
    }
    return values[outputIndex];
  };

  const define = z.function({
    input: executable.inputSchemas,
    output: executable.outputSchema,
  });

  return {
    name: executable.name,
    define,
    implement,
  };
}
