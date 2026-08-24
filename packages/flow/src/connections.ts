import type { StandardFnSchema } from "@fn-sphere/core";
import { isCompatibleType } from "zod-compare";
import type { $ZodType } from "zod/v4/core";
import type {
  FlowEdgeSpec,
  FlowFnNodeSpec,
  FlowInputNodeSpec,
  FlowNodeSpec,
  FlowOutputNodeSpec,
} from "./schema.js";
import type { FlowDiagnostic } from "./types.js";

export type ResolvedFnNode = {
  fn: StandardFnSchema;
  inputSchemas: $ZodType[];
  outputSchema: $ZodType;
};

type InspectConnectionsOptions = {
  edges: FlowEdgeSpec[];
  fnNodes: FlowFnNodeSpec[];
  nodeById: Map<string, FlowNodeSpec>;
  fnByNodeId: Map<string, ResolvedFnNode>;
  inputNode: FlowInputNodeSpec | undefined;
  outputNode: FlowOutputNodeSpec | undefined;
  addError: (diagnostic: Omit<FlowDiagnostic, "severity">) => void;
};

const isHandleIndex = (handle: number) =>
  Number.isInteger(handle) && handle >= 0;

export const inspectConnections = ({
  edges,
  fnNodes,
  nodeById,
  fnByNodeId,
  inputNode,
  outputNode,
  addError,
}: InspectConnectionsOptions) => {
  const incomingEdges = new Map<string, Map<number, FlowEdgeSpec[]>>();
  const incomingPorts: FlowEdgeSpec[][] = [];
  const getIncomingEdges = (nodeId: string, handle: number) =>
    incomingEdges.get(nodeId)?.get(handle) ?? [];
  const addIncomingEdge = (edge: FlowEdgeSpec) => {
    const edgesByHandle = incomingEdges.get(edge.target) ?? new Map();
    let edges = edgesByHandle.get(edge.targetHandle);
    if (!edges) {
      edges = [];
      incomingPorts.push(edges);
    }
    edges.push(edge);
    edgesByHandle.set(edge.targetHandle, edges);
    incomingEdges.set(edge.target, edgesByHandle);
  };

  const inputSchemaByHandle = new Map<number, $ZodType>();
  const inputEdgeByHandle = new Map<number, FlowEdgeSpec>();

  const inspectSource = (
    edge: FlowEdgeSpec,
    sourceNode: FlowNodeSpec | undefined,
  ) => {
    if (!sourceNode) {
      addError({
        code: "unknown-source-node",
        message: `Unknown source node: ${edge.source}`,
        edgeId: edge.id,
        nodeId: edge.source,
      });
      return undefined;
    }

    if (sourceNode.type === "input") {
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
      return undefined;
    }

    if (sourceNode.type === "fn") {
      const fnNode = fnByNodeId.get(sourceNode.id);
      if (edge.sourceHandle !== 0) {
        addError({
          code: "invalid-source-handle",
          message: `Invalid function output handle: ${edge.sourceHandle}`,
          edgeId: edge.id,
          nodeId: sourceNode.id,
          handle: edge.sourceHandle,
        });
        return undefined;
      }
      return fnNode?.outputSchema;
    }

    addError({
      code: "invalid-source-handle",
      message: "Output nodes cannot be edge sources.",
      edgeId: edge.id,
      nodeId: sourceNode.id,
      handle: edge.sourceHandle,
    });
    return undefined;
  };

  const inspectTarget = (
    edge: FlowEdgeSpec,
    sourceNode: FlowNodeSpec | undefined,
    targetNode: FlowNodeSpec,
  ) => {
    if (targetNode.type === "fn") {
      const fnNode = fnByNodeId.get(targetNode.id);
      const index = edge.targetHandle;
      if (!isHandleIndex(index)) {
        addError({
          code: "invalid-target-handle",
          message: `Invalid function input handle: ${edge.targetHandle}`,
          edgeId: edge.id,
          nodeId: targetNode.id,
          handle: edge.targetHandle,
        });
      } else if (fnNode) {
        const inputSchema = fnNode.inputSchemas[index];
        if (inputSchema) {
          if (
            sourceNode?.type === "input" &&
            !inputSchemaByHandle.has(edge.sourceHandle)
          ) {
            inputSchemaByHandle.set(edge.sourceHandle, inputSchema);
          }
          return inputSchema;
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
      return undefined;
    }

    if (targetNode.type === "output") {
      if (edge.targetHandle !== 0) {
        addError({
          code: "invalid-target-handle",
          message: `Invalid flow output handle: ${edge.targetHandle}`,
          edgeId: edge.id,
          nodeId: targetNode.id,
          handle: edge.targetHandle,
        });
      }
      return undefined;
    }

    addError({
      code: "invalid-target-handle",
      message: "Input nodes cannot be edge targets.",
      edgeId: edge.id,
      nodeId: targetNode.id,
      handle: edge.targetHandle,
    });
    return undefined;
  };

  for (const edge of edges) {
    const sourceNode = nodeById.get(edge.source);
    const targetNode = nodeById.get(edge.target);
    if (!targetNode) {
      continue;
    }
    const sourceSchema = inspectSource(edge, sourceNode);
    const targetSchema = inspectTarget(edge, sourceNode, targetNode);

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

    addIncomingEdge(edge);
  }

  for (const edges of incomingPorts) {
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
      ...(inputNode ? { nodeId: inputNode.id } : {}),
      handle,
    });
  }

  const inputEdgesByNodeId = new Map<string, FlowEdgeSpec[]>();
  for (const node of fnNodes) {
    const fnNode = fnByNodeId.get(node.id);
    if (!fnNode) {
      continue;
    }
    const inputEdges: FlowEdgeSpec[] = [];
    fnNode.inputSchemas.forEach((_, index) => {
      const inputEdge = getIncomingEdges(node.id, index)[0];
      if (inputEdge) {
        inputEdges.push(inputEdge);
      } else {
        addError({
          code: "missing-input-edge",
          message: `Missing edge for ${node.id}.${index}.`,
          nodeId: node.id,
          handle: index,
        });
      }
    });
    if (inputEdges.length === fnNode.inputSchemas.length) {
      inputEdgesByNodeId.set(node.id, inputEdges);
    }
  }

  const outputEdge = outputNode
    ? getIncomingEdges(outputNode.id, 0)[0]
    : undefined;
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
    outputSchema = fnByNodeId.get(outputSourceNode.id)?.outputSchema;
  } else if (outputSourceNode?.type === "input" && outputEdge) {
    outputSchema = inputSchemaByHandle.get(outputEdge.sourceHandle);
  }

  return {
    inputEdgesByNodeId,
    inputSchemas,
    outputEdge,
    outputSchema,
  };
};
