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

export type FlowCompilation =
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

export function compileFlow(options: CompileFlowOptions): FlowCompilation {
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

// Resolves edges to value positions so the runtime closure keeps only plain indices.
const planExecution = (executable: ExecutableFlow) => {
  const inputCount = executable.inputSchemas.length;
  const outputIndices = new Map(
    executable.nodes.map((node, index) => [node.id, inputCount + index]),
  );
  const sourceIndex = (edge: FlowEdgeSpec) =>
    edge.source === executable.inputNodeId
      ? edge.sourceHandle
      : outputIndices.get(edge.source)!;
  return {
    inputCount,
    steps: executable.nodes.map((node) => ({
      run: implementFn(node.fn),
      inputs: node.inputEdges.map(sourceIndex),
    })),
    outputIndex: sourceIndex(executable.outputEdge),
  };
};

function compileExecutable(
  executable: ExecutableFlow,
): StandardFnSchema<CompiledFlowFunction> {
  const { inputCount, steps, outputIndex } = planExecution(executable);

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
