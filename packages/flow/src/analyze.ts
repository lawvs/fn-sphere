import type { StandardFnSchema } from "@fn-sphere/core";
import { isCompatibleType } from "zod-compare";
import type { $ZodTuple, $ZodType } from "zod/v4/core";
import type {
  FlowEdgeSpec,
  FlowFnNodeSpec,
  FlowNodeSpec,
  FlowSpec,
} from "./schema.js";
import type { FlowAnalysis, FlowDiagnostic } from "./types.js";

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

type DiagnosticInput = Omit<FlowDiagnostic, "severity">;

const targetPortKey = (nodeId: string, handle: number) =>
  `${nodeId}\0${handle}`;

const isHandleIndex = (handle: number) =>
  Number.isInteger(handle) && handle >= 0;

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

const getOutputSchema = (fnSchema: Pick<StandardFnSchema, "define">) =>
  fnSchema.define._zod.def.output;

export const inspectFlow = ({
  flow: flowSpec,
  fnList,
}: InspectFlowOptions): InspectFlowResult => {
  const diagnostics: FlowDiagnostic[] = [];
  const addError = (diagnostic: DiagnosticInput) => {
    diagnostics.push({ ...diagnostic, severity: "error" });
  };
  const addWarning = (diagnostic: DiagnosticInput) => {
    diagnostics.push({ ...diagnostic, severity: "warning" });
  };

  const nodeById = new Map<string, FlowNodeSpec>();
  for (const node of flowSpec.nodes) {
    if (nodeById.has(node.id)) {
      addError({
        code: "duplicate-node-id",
        message: `Duplicate node id: ${node.id}`,
        nodeId: node.id,
      });
      continue;
    }
    nodeById.set(node.id, node);
  }

  const edgeIds = new Set<string>();
  for (const edge of flowSpec.edges) {
    if (edgeIds.has(edge.id)) {
      addError({
        code: "duplicate-edge-id",
        message: `Duplicate edge id: ${edge.id}`,
        edgeId: edge.id,
      });
    }
    edgeIds.add(edge.id);
  }

  const fnByName = new Map<string, StandardFnSchema>();
  for (const fnSchema of fnList) {
    if (fnByName.has(fnSchema.name)) {
      addError({
        code: "duplicate-function-name",
        message: `Duplicate function name: ${fnSchema.name}`,
      });
      continue;
    }
    fnByName.set(fnSchema.name, fnSchema);
  }

  const inputNodes = flowSpec.nodes.filter((node) => node.type === "input");
  if (inputNodes.length === 0) {
    addError({
      code: "missing-input-node",
      message: "Flow requires one input node.",
    });
  } else if (inputNodes.length > 1) {
    addError({
      code: "multiple-input-nodes",
      message: "Flow requires exactly one input node.",
    });
  }

  const outputNodes = flowSpec.nodes.filter((node) => node.type === "output");
  if (outputNodes.length === 0) {
    addError({
      code: "missing-output-node",
      message: "Flow requires one output node.",
    });
  } else if (outputNodes.length > 1) {
    addError({
      code: "multiple-output-nodes",
      message: "Flow requires exactly one output node.",
    });
  }

  const fnNodes = flowSpec.nodes.filter(
    (node): node is FlowFnNodeSpec => node.type === "fn",
  );

  const incomingEdgesByNode = new Map<string, FlowEdgeSpec[]>();
  for (const edge of flowSpec.edges) {
    const edges = incomingEdgesByNode.get(edge.target) ?? [];
    edges.push(edge);
    incomingEdgesByNode.set(edge.target, edges);
  }

  const activeNodeIds = new Set<string>();
  const activeEdgeRefs = new Set<FlowEdgeSpec>();
  const visitNodeInputs = (nodeId: string) => {
    if (activeNodeIds.has(nodeId)) {
      return;
    }
    activeNodeIds.add(nodeId);

    for (const edge of incomingEdgesByNode.get(nodeId) ?? []) {
      activeEdgeRefs.add(edge);
      const sourceNode = nodeById.get(edge.source);
      if (sourceNode) {
        visitNodeInputs(sourceNode.id);
      }
    }
  };

  const outputNode = outputNodes.length === 1 ? outputNodes[0] : undefined;
  if (outputNode) {
    visitNodeInputs(outputNode.id);
  }

  const activeFnNodes = fnNodes.filter((node) => activeNodeIds.has(node.id));
  const activeEdges = flowSpec.edges.filter((edge) => activeEdgeRefs.has(edge));

  for (const node of fnNodes) {
    if (!activeNodeIds.has(node.id)) {
      addWarning({
        code: "unreachable-node",
        message: `Node ${node.id} does not contribute to the flow output.`,
        nodeId: node.id,
      });
    }
  }

  const fnByNodeId = new Map<string, StandardFnSchema>();
  const inputSchemasByNodeId = new Map<string, $ZodType[]>();
  for (const node of activeFnNodes) {
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
    fnByNodeId.set(node.id, fnSchema);
    inputSchemasByNodeId.set(node.id, inputSchemas);
  }

  const incomingEdges = new Map<string, FlowEdgeSpec[]>();
  const getIncomingEdge = (nodeId: string, handle: number) =>
    incomingEdges.get(targetPortKey(nodeId, handle))?.[0];
  const inputSchemaByHandle = new Map<number, $ZodType>();
  const inputEdgeByHandle = new Map<number, FlowEdgeSpec>();
  const sourceSchemas = new Map<FlowEdgeSpec, $ZodType>();
  const targetSchemas = new Map<FlowEdgeSpec, $ZodType>();

  for (const edge of activeEdges) {
    const sourceNode = nodeById.get(edge.source);
    const targetNode = nodeById.get(edge.target);

    if (!sourceNode) {
      addError({
        code: "unknown-source-node",
        message: `Unknown source node: ${edge.source}`,
        edgeId: edge.id,
        nodeId: edge.source,
      });
    } else if (sourceNode.type === "input") {
      const index = edge.sourceHandle;
      if (!isHandleIndex(index)) {
        addError({
          code: "invalid-source-handle",
          message: `Invalid input handle: ${edge.sourceHandle}`,
          edgeId: edge.id,
          nodeId: sourceNode.id,
          handle: edge.sourceHandle,
        });
      } else if (inputEdgeByHandle.has(index)) {
        addError({
          code: "multiple-input-consumers",
          message: `Flow input handle ${index} can only connect to one node.`,
          nodeId: sourceNode.id,
          edgeId: edge.id,
          handle: index,
        });
      } else {
        inputEdgeByHandle.set(index, edge);
      }
    } else if (sourceNode.type === "fn") {
      const fnSchema = fnByNodeId.get(sourceNode.id);
      if (edge.sourceHandle !== 0) {
        addError({
          code: "invalid-source-handle",
          message: `Invalid function output handle: ${edge.sourceHandle}`,
          edgeId: edge.id,
          nodeId: sourceNode.id,
          handle: edge.sourceHandle,
        });
      } else if (fnSchema) {
        sourceSchemas.set(edge, getOutputSchema(fnSchema));
      }
    } else {
      addError({
        code: "invalid-source-handle",
        message: "Output nodes cannot be edge sources.",
        edgeId: edge.id,
        nodeId: sourceNode.id,
        handle: edge.sourceHandle,
      });
    }

    if (!targetNode) {
      addError({
        code: "unknown-target-node",
        message: `Unknown target node: ${edge.target}`,
        edgeId: edge.id,
        nodeId: edge.target,
      });
      continue;
    }

    if (targetNode.type === "fn") {
      const fnSchema = fnByNodeId.get(targetNode.id);
      const index = edge.targetHandle;
      if (!isHandleIndex(index)) {
        addError({
          code: "invalid-target-handle",
          message: `Invalid function input handle: ${edge.targetHandle}`,
          edgeId: edge.id,
          nodeId: targetNode.id,
          handle: edge.targetHandle,
        });
      } else if (fnSchema) {
        const targetSchema = inputSchemasByNodeId.get(targetNode.id)?.[index];
        if (targetSchema) {
          targetSchemas.set(edge, targetSchema);
          if (
            sourceNode?.type === "input" &&
            !inputSchemaByHandle.has(edge.sourceHandle)
          ) {
            inputSchemaByHandle.set(edge.sourceHandle, targetSchema);
          }
        } else {
          addError({
            code: "invalid-target-handle",
            message: `Invalid function input handle: ${edge.targetHandle}`,
            edgeId: edge.id,
            nodeId: targetNode.id,
            handle: edge.targetHandle,
          });
        }
      }
    } else if (targetNode.type === "output") {
      if (edge.targetHandle !== 0) {
        addError({
          code: "invalid-target-handle",
          message: `Invalid flow output handle: ${edge.targetHandle}`,
          edgeId: edge.id,
          nodeId: targetNode.id,
          handle: edge.targetHandle,
        });
      }
    } else {
      addError({
        code: "invalid-target-handle",
        message: "Input nodes cannot be edge targets.",
        edgeId: edge.id,
        nodeId: targetNode.id,
        handle: edge.targetHandle,
      });
    }

    const key = targetPortKey(edge.target, edge.targetHandle);
    const edges = incomingEdges.get(key) ?? [];
    edges.push(edge);
    incomingEdges.set(key, edges);
  }

  for (const edges of incomingEdges.values()) {
    if (edges.length < 2) {
      continue;
    }
    const edge = edges[0];
    if (!edge) {
      continue;
    }
    addError({
      code: "multiple-input-edges",
      message: `Multiple edges target ${edge.target}.${edge.targetHandle}.`,
      nodeId: edge.target,
      edgeId: edge.id,
      handle: edge.targetHandle,
    });
  }

  const inputSchemas: $ZodType[] = [];
  const lastInputHandle = Math.max(-1, ...inputEdgeByHandle.keys());
  for (let handle = 0; handle <= lastInputHandle; handle += 1) {
    const inputSchema = inputSchemaByHandle.get(handle);
    if (inputSchema) {
      inputSchemas.push(inputSchema);
      continue;
    }
    addError({
      code: "unresolved-input-schema",
      message: `Cannot infer schema for flow input handle ${handle}.`,
      ...(inputNodes[0] ? { nodeId: inputNodes[0].id } : {}),
      handle,
    });
  }

  for (const node of activeFnNodes) {
    const inputSchemas = inputSchemasByNodeId.get(node.id);
    if (!inputSchemas) {
      continue;
    }
    inputSchemas.forEach((_, index) => {
      if (!getIncomingEdge(node.id, index)) {
        addError({
          code: "missing-input-edge",
          message: `Missing edge for ${node.id}.${index}.`,
          nodeId: node.id,
          handle: index,
        });
      }
    });
  }

  const outputEdge = outputNode ? getIncomingEdge(outputNode.id, 0) : undefined;
  if (outputNode && !outputEdge) {
    addError({
      code: "missing-input-edge",
      message: `Missing edge for ${outputNode.id}.input.`,
      nodeId: outputNode.id,
      handle: 0,
    });
  }

  const outputSourceNode = outputEdge
    ? nodeById.get(outputEdge.source)
    : undefined;
  let outputSchema: $ZodType | undefined;
  if (outputSourceNode?.type === "fn") {
    const outputFn = fnByNodeId.get(outputSourceNode.id);
    if (outputFn) {
      outputSchema = getOutputSchema(outputFn);
    }
  } else if (outputSourceNode?.type === "input" && outputEdge) {
    outputSchema = inputSchemaByHandle.get(outputEdge.sourceHandle);
  }

  for (const edge of activeEdges) {
    const sourceSchema = sourceSchemas.get(edge);
    const targetSchema = targetSchemas.get(edge);
    if (
      sourceSchema &&
      targetSchema &&
      !isCompatibleType(targetSchema, sourceSchema)
    ) {
      addError({
        code: "incompatible-edge",
        message: `Incompatible edge: ${edge.id}`,
        edgeId: edge.id,
      });
    }
  }

  const fnNodeById = new Map(activeFnNodes.map((node) => [node.id, node]));
  const outgoing = new Map<string, string[]>();
  const inDegree = new Map(activeFnNodes.map((node) => [node.id, 0]));
  for (const edge of activeEdges) {
    if (!fnNodeById.has(edge.source) || !fnNodeById.has(edge.target)) {
      continue;
    }
    const targets = outgoing.get(edge.source) ?? [];
    targets.push(edge.target);
    outgoing.set(edge.source, targets);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue = activeFnNodes.filter((node) => inDegree.get(node.id) === 0);
  const orderedFnNodes: FlowFnNodeSpec[] = [];
  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index];
    if (!node) {
      continue;
    }
    orderedFnNodes.push(node);
    for (const targetId of outgoing.get(node.id) ?? []) {
      const nextDegree = (inDegree.get(targetId) ?? 0) - 1;
      inDegree.set(targetId, nextDegree);
      if (nextDegree === 0) {
        const target = fnNodeById.get(targetId);
        if (target) {
          queue.push(target);
        }
      }
    }
  }

  if (orderedFnNodes.length !== activeFnNodes.length) {
    addError({
      code: "cycle",
      message: "Flow contains a cycle.",
    });
  }

  const hasErrors = diagnostics.some(
    (diagnostic) => diagnostic.severity === "error",
  );
  if (hasErrors || !inputNodes[0] || !outputEdge || !outputSchema) {
    return {
      valid: false,
      diagnostics,
    };
  }

  const nodes = orderedFnNodes.map((node) => ({
    id: node.id,
    fn: fnByNodeId.get(node.id)!,
    inputEdges: inputSchemasByNodeId
      .get(node.id)!
      .map((_, index) => getIncomingEdge(node.id, index)!),
  }));

  return {
    valid: true,
    diagnostics,
    executable: {
      inputNodeId: inputNodes[0].id,
      inputSchemas,
      name: flowSpec.name,
      nodes,
      outputEdge,
      outputSchema,
    },
  };
};

export const analyzeFlow = (options: InspectFlowOptions): FlowAnalysis => {
  const inspected = inspectFlow(options);
  return {
    valid: inspected.valid,
    diagnostics: inspected.diagnostics,
  };
};
