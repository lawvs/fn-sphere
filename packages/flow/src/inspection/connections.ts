import type { StandardFnSchema } from "@fn-sphere/core";
import { isCompatibleType } from "zod-compare";
import type { $ZodType } from "zod/v4/core";
import type { FlowEdgeSpec, FlowNodeSpec } from "../schema.js";
import type { FlowDiagnostic } from "../types.js";
import type { ActiveFlow } from "./graph.js";

export type ResolvedFnNode = {
  fn: StandardFnSchema;
  inputSchemas: $ZodType[];
  outputSchema: $ZodType;
};

type InspectConnectionsOptions = {
  flow: ActiveFlow;
  fnByNodeId: Map<string, ResolvedFnNode>;
  addError: (diagnostic: Omit<FlowDiagnostic, "severity">) => void;
};

const isHandleIndex = (handle: number) =>
  Number.isInteger(handle) && handle >= 0;

type ResolvedSource =
  { type: "input"; handle: number } | { type: "fn"; schema: $ZodType };

export const inspectConnections = ({
  flow,
  fnByNodeId,
  addError,
}: InspectConnectionsOptions) => {
  const { edges, nodeById, inputNode, outputNode, getIncomingEdges } = flow;

  // Presence records a consumer even when its schema cannot be resolved.
  const inputBindings = new Map<number, $ZodType | undefined>();

  const inspectSource = (
    edge: FlowEdgeSpec,
    sourceNode: FlowNodeSpec | undefined,
  ): ResolvedSource | undefined => {
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
        return undefined;
      }
      return { type: "input", handle: index };
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
      return fnNode ? { type: "fn", schema: fnNode.outputSchema } : undefined;
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

  const inspectTarget = (edge: FlowEdgeSpec, targetNode: FlowNodeSpec) => {
    if (targetNode.type === "fn") {
      const fnNode = fnByNodeId.get(targetNode.id);
      const index = edge.targetHandle;
      const inputSchema = fnNode?.inputSchemas[index];
      if (!isHandleIndex(index) || (fnNode && !inputSchema)) {
        addError({
          code: "invalid-target-handle",
          message: `Invalid function input handle: ${edge.targetHandle}`,
          edgeId: edge.id,
          nodeId: targetNode.id,
          handle: edge.targetHandle,
        });
        return undefined;
      }
      return inputSchema;
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
    const source = inspectSource(edge, sourceNode);
    if (source?.type === "input" && inputBindings.has(source.handle)) {
      addError({
        code: "multiple-input-consumers",
        message: `Flow input handle ${source.handle} can only connect to one node.`,
        nodeId: edge.source,
        edgeId: edge.id,
        handle: source.handle,
      });
    }
    const targetSchema = inspectTarget(edge, targetNode);
    if (source?.type === "input") {
      inputBindings.set(
        source.handle,
        inputBindings.get(source.handle) ?? targetSchema,
      );
    }

    if (
      source?.type === "fn" &&
      targetSchema &&
      !isCompatibleType(targetSchema, source.schema)
    ) {
      addError({
        code: "incompatible-edge",
        message: `Incompatible edge: ${edge.id}`,
        edgeId: edge.id,
      });
    }
  }

  for (const edge of edges) {
    const portEdges = getIncomingEdges(edge.target, edge.targetHandle);
    if (portEdges.length > 1 && portEdges[0] === edge) {
      addError({
        code: "multiple-input-edges",
        message: `Multiple edges target ${edge.target}.${edge.targetHandle}.`,
        nodeId: edge.target,
        edgeId: edge.id,
        handle: edge.targetHandle,
      });
    }
  }

  const inputSchemas: $ZodType[] = [];
  const lastInputHandle = Math.max(-1, ...inputBindings.keys());
  for (let handle = 0; handle <= lastInputHandle; handle += 1) {
    const inputSchema = inputBindings.get(handle);
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
  for (const [nodeId, fnNode] of fnByNodeId) {
    const inputEdges: FlowEdgeSpec[] = [];
    fnNode.inputSchemas.forEach((_, index) => {
      const inputEdge = getIncomingEdges(nodeId, index)[0];
      if (inputEdge) {
        inputEdges.push(inputEdge);
      } else {
        addError({
          code: "missing-input-edge",
          message: `Missing edge for ${nodeId}.${index}.`,
          nodeId,
          handle: index,
        });
      }
    });
    if (inputEdges.length === fnNode.inputSchemas.length) {
      inputEdgesByNodeId.set(nodeId, inputEdges);
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

  const outputSchema = outputEdge
    ? fnByNodeId.get(outputEdge.source)?.outputSchema
    : undefined;

  return {
    inputEdgesByNodeId,
    inputSchemas,
    outputEdge,
    outputSchema,
  };
};
