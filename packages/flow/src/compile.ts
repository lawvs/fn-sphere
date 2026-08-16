import type { StandardFnSchema } from "@fn-sphere/core";
import type { $ZodFunction } from "zod/v4/core";
import { inspectFlow } from "./analyze.js";
import type { FlowEdgeSpec } from "./schema.js";
import type { FlowFnSchema, FlowSchema } from "./types.js";

type CompileFlowOptions<T extends $ZodFunction> = {
  flow: FlowSchema<T>;
  fnList: readonly StandardFnSchema[];
};

type RuntimeFn = (...args: unknown[]) => unknown;

const implementFn = (fnSchema: StandardFnSchema): RuntimeFn =>
  fnSchema.skipValidate
    ? (fnSchema.implement as RuntimeFn)
    : (fnSchema.define.implement(fnSchema.implement) as RuntimeFn);

export function compileFlow<T extends $ZodFunction>({
  flow: flowSchema,
  fnList,
}: CompileFlowOptions<T>): FlowFnSchema<T> {
  const flowSpec = flowSchema.flow;
  const inspected = inspectFlow({ flow: flowSchema, fnList });
  if (!inspected.analysis.valid) {
    const codes = [
      ...new Set(
        inspected.analysis.diagnostics.map((diagnostic) => diagnostic.code),
      ),
    ];
    throw new Error(`Cannot compile invalid flow: ${codes.join(", ")}`);
  }

  const outputNode = flowSpec.nodes.find((node) => node.type === "output");
  if (!outputNode) {
    throw new Error("Cannot compile flow without an output node.");
  }
  const outputEdge = inspected.getIncomingEdge(outputNode.id, 0);
  if (!outputEdge) {
    throw new Error("Cannot compile flow without an output edge.");
  }

  const reachableNodeIds = new Set<string>();
  const visitSource = (edge: FlowEdgeSpec) => {
    const sourceNode = inspected.nodeById.get(edge.source);
    if (!sourceNode || sourceNode.type !== "fn") {
      return;
    }
    if (reachableNodeIds.has(sourceNode.id)) {
      return;
    }
    reachableNodeIds.add(sourceNode.id);

    const inputSchemas = inspected.inputSchemasByNodeId.get(sourceNode.id);
    if (!inputSchemas) {
      return;
    }
    inputSchemas.forEach((_, index) => {
      const inputEdge = inspected.getIncomingEdge(sourceNode.id, index);
      if (inputEdge) {
        visitSource(inputEdge);
      }
    });
  };
  visitSource(outputEdge);

  const orderedFnNodes = inspected.orderedFnNodes.filter((node) =>
    reachableNodeIds.has(node.id),
  );
  const implementedFnByNodeId = new Map<string, RuntimeFn>();
  for (const node of orderedFnNodes) {
    const fnSchema = inspected.fnByNodeId.get(node.id);
    if (fnSchema) {
      implementedFnByNodeId.set(node.id, implementFn(fnSchema));
    }
  }

  const resolveSource = (
    edge: FlowEdgeSpec,
    args: unknown[],
    results: Map<string, unknown>,
  ) => {
    const sourceNode = inspected.nodeById.get(edge.source);
    if (sourceNode?.type === "input") {
      return args[edge.sourceHandle];
    }
    return results.get(edge.source);
  };

  const implement = ((...args: unknown[]) => {
    const results = new Map<string, unknown>();
    for (const node of orderedFnNodes) {
      const inputSchemas = inspected.inputSchemasByNodeId.get(node.id);
      const fn = implementedFnByNodeId.get(node.id);
      if (!inputSchemas || !fn) {
        continue;
      }
      const nodeArgs = inputSchemas.map((_, index) => {
        const edge = inspected.getIncomingEdge(node.id, index);
        return edge ? resolveSource(edge, args, results) : undefined;
      });
      results.set(node.id, fn(...nodeArgs));
    }
    return resolveSource(outputEdge, args, results);
  }) as FlowFnSchema<T>["implement"];

  return {
    ...flowSchema,
    implement,
  };
}
