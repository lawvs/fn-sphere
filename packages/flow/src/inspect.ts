import type { StandardFnSchema } from "@fn-sphere/core";
import type { $ZodTuple, $ZodType } from "zod/v4/core";
import { inspectConnections, type ResolvedFnNode } from "./connections.js";
import { getOutputSlice, indexFlow, orderFnNodes } from "./graph.js";
import type { FlowEdgeSpec, FlowSpec } from "./schema.js";
import type { FlowDiagnostic } from "./types.js";

type InspectFlowOptions = {
  flow: FlowSpec;
  fnList: readonly StandardFnSchema[];
};

type ExecutableFlow = {
  inputNodeId: string;
  inputSchemas: $ZodType[];
  name: string;
  nodes: {
    id: string;
    fn: StandardFnSchema;
    inputEdges: FlowEdgeSpec[];
  }[];
  outputEdge: FlowEdgeSpec;
  outputSchema: $ZodType;
};

type InspectFlowResult =
  | {
      valid: false;
      diagnostics: FlowDiagnostic[];
    }
  | {
      valid: true;
      diagnostics: FlowDiagnostic[];
      executable: ExecutableFlow;
    };

const getInputSchemas = (fnSchema: Pick<StandardFnSchema, "define">) => {
  const input = fnSchema.define._zod.def.input;
  if (input._zod.def.type !== "tuple") {
    return undefined;
  }
  const tuple = input as $ZodTuple;
  if (tuple._zod.def.rest) {
    return undefined;
  }
  return tuple._zod.def.items as $ZodType[];
};

export const inspectFlow = ({
  flow,
  fnList,
}: InspectFlowOptions): InspectFlowResult => {
  const diagnostics: FlowDiagnostic[] = [];
  const addError = (diagnostic: Omit<FlowDiagnostic, "severity">) => {
    diagnostics.push({ ...diagnostic, severity: "error" });
  };
  const addWarning = (diagnostic: Omit<FlowDiagnostic, "severity">) => {
    diagnostics.push({ ...diagnostic, severity: "warning" });
  };

  const index = indexFlow(flow);
  for (const nodeId of index.duplicateNodeIds) {
    addError({
      code: "duplicate-node-id",
      message: `Duplicate node id: ${nodeId}`,
      nodeId,
    });
  }
  for (const edgeId of index.duplicateEdgeIds) {
    addError({
      code: "duplicate-edge-id",
      message: `Duplicate edge id: ${edgeId}`,
      edgeId,
    });
  }

  const fnByName = new Map<string, StandardFnSchema>();
  const duplicateFnNames = new Set<string>();
  for (const fnSchema of fnList) {
    if (fnByName.has(fnSchema.name)) {
      duplicateFnNames.add(fnSchema.name);
      continue;
    }
    fnByName.set(fnSchema.name, fnSchema);
  }

  if (index.inputNodes.length === 0) {
    addError({
      code: "missing-input-node",
      message: "Flow requires one input node.",
    });
  } else if (index.inputNodes.length > 1) {
    addError({
      code: "multiple-input-nodes",
      message: "Flow requires exactly one input node.",
    });
  }

  if (index.outputNodes.length === 0) {
    addError({
      code: "missing-output-node",
      message: "Flow requires one output node.",
    });
  } else if (index.outputNodes.length > 1) {
    addError({
      code: "multiple-output-nodes",
      message: "Flow requires exactly one output node.",
    });
  }

  const outputNode =
    index.outputNodes.length === 1 ? index.outputNodes[0] : undefined;
  const slice = getOutputSlice(flow, index, outputNode);

  if (outputNode) {
    for (const node of index.fnNodes) {
      if (!slice.nodeIds.has(node.id)) {
        addWarning({
          code: "unreachable-node",
          message: `Node ${node.id} does not contribute to the flow output.`,
          nodeId: node.id,
        });
      }
    }
  }

  const fnByNodeId = new Map<string, ResolvedFnNode>();
  for (const node of slice.fnNodes) {
    if (duplicateFnNames.has(node.fnName)) {
      addError({
        code: "duplicate-function-name",
        message: `Duplicate function name: ${node.fnName}`,
        nodeId: node.id,
      });
      continue;
    }
    const fnSchema = fnByName.get(node.fnName);
    if (!fnSchema) {
      addError({
        code: "unknown-function",
        message: `Unknown function: ${node.fnName}`,
        nodeId: node.id,
      });
      continue;
    }
    const inputSchemas = getInputSchemas(fnSchema);
    if (!inputSchemas) {
      addError({
        code: "unsupported-function-input",
        message: `Function ${node.fnName} must use a fixed tuple input schema.`,
        nodeId: node.id,
      });
      continue;
    }
    fnByNodeId.set(node.id, {
      fn: fnSchema,
      inputSchemas,
      outputSchema: fnSchema.define._zod.def.output,
    });
  }

  const connections = inspectConnections({
    edges: slice.edges,
    fnNodes: slice.fnNodes,
    nodeById: index.nodeById,
    fnByNodeId,
    inputNode: index.inputNodes[0],
    outputNode,
    addError,
  });

  const ordered = orderFnNodes(slice.fnNodes, slice.edges);
  if (ordered.hasCycle) {
    addError({
      code: "cycle",
      message: "Flow contains a cycle.",
    });
  }

  const hasErrors = diagnostics.some(
    (diagnostic) => diagnostic.severity === "error",
  );
  if (
    hasErrors ||
    !index.inputNodes[0] ||
    !connections.outputEdge ||
    !connections.outputSchema
  ) {
    return {
      valid: false,
      diagnostics,
    };
  }

  // Error-free inspection guarantees each active function and input edge is resolved.
  const nodes = ordered.nodes.map((node) => {
    const resolved = fnByNodeId.get(node.id)!;
    return {
      id: node.id,
      fn: resolved.fn,
      inputEdges: connections.inputEdgesByNodeId.get(node.id)!,
    };
  });

  return {
    valid: true,
    diagnostics,
    executable: {
      inputNodeId: index.inputNodes[0].id,
      inputSchemas: connections.inputSchemas,
      name: flow.name,
      nodes,
      outputEdge: connections.outputEdge,
      outputSchema: connections.outputSchema,
    },
  };
};
