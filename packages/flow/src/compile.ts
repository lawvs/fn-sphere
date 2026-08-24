import type { StandardFnSchema } from "@fn-sphere/core";
import { z } from "zod";
import type {
  $ZodFunction,
  $ZodTuple,
  $ZodType,
  $ZodUnknown,
} from "zod/v4/core";
import { inspectFlow } from "./inspection/inspect.js";
import type { FlowEdgeSpec, FlowSpec } from "./schema.js";

type CompileFlowOptions = {
  flow: FlowSpec;
  fnList: readonly StandardFnSchema[];
};

type RuntimeFn = (...args: unknown[]) => unknown;
type CompiledFlowFunction = $ZodFunction<$ZodTuple<[], $ZodUnknown>, $ZodType>;

const implementFn = (fnSchema: StandardFnSchema): RuntimeFn =>
  fnSchema.skipValidate
    ? (fnSchema.implement as RuntimeFn)
    : (fnSchema.define.implement(fnSchema.implement) as RuntimeFn);

export function compileFlow(
  options: CompileFlowOptions,
): StandardFnSchema<CompiledFlowFunction> {
  const inspected = inspectFlow(options);
  if (!inspected.valid) {
    const codes = [
      ...new Set(
        inspected.diagnostics
          .filter((diagnostic) => diagnostic.severity === "error")
          .map((diagnostic) => diagnostic.code),
      ),
    ];
    throw new Error(`Cannot compile invalid flow: ${codes.join(", ")}`);
  }

  const { executable } = inspected;
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
