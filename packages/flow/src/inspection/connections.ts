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

  const addEdgeError = (
    edge: FlowEdgeSpec,
    code: FlowDiagnostic["code"],
    message: string,
    nodeId: string,
    handle?: number,
  ) =>
    addError({
      code,
      message,
      edgeId: edge.id,
      nodeId,
      ...(handle === undefined ? {} : { handle }),
    });

  const inspectSource = (
    edge: FlowEdgeSpec,
    sourceNode: FlowNodeSpec | undefined,
  ): ResolvedSource | undefined => {
    if (!sourceNode) {
      addEdgeError(
        edge,
        "unknown-source-node",
        `Unknown source node: ${edge.source}`,
        edge.source,
      );
      return undefined;
    }

    if (sourceNode.type === "input") {
      if (!isHandleIndex(edge.sourceHandle)) {
        addEdgeError(
          edge,
          "invalid-source-handle",
          `Invalid input handle: ${edge.sourceHandle}`,
          sourceNode.id,
          edge.sourceHandle,
        );
        return undefined;
      }
      return { type: "input", handle: edge.sourceHandle };
    }

    if (sourceNode.type === "fn") {
      if (edge.sourceHandle !== 0) {
        addEdgeError(
          edge,
          "invalid-source-handle",
          `Invalid function output handle: ${edge.sourceHandle}`,
          sourceNode.id,
          edge.sourceHandle,
        );
        return undefined;
      }
      const fnNode = fnByNodeId.get(sourceNode.id);
      return fnNode ? { type: "fn", schema: fnNode.outputSchema } : undefined;
    }

    addEdgeError(
      edge,
      "invalid-source-handle",
      "Output nodes cannot be edge sources.",
      sourceNode.id,
      edge.sourceHandle,
    );
    return undefined;
  };

  const inspectTarget = (edge: FlowEdgeSpec, targetNode: FlowNodeSpec) => {
    if (targetNode.type === "fn") {
      const fnNode = fnByNodeId.get(targetNode.id);
      const inputSchema = fnNode?.inputSchemas[edge.targetHandle];
      if (!isHandleIndex(edge.targetHandle) || (fnNode && !inputSchema)) {
        addEdgeError(
          edge,
          "invalid-target-handle",
          `Invalid function input handle: ${edge.targetHandle}`,
          targetNode.id,
          edge.targetHandle,
        );
        return undefined;
      }
      return inputSchema;
    }

    if (targetNode.type === "output") {
      if (edge.targetHandle !== 0) {
        addEdgeError(
          edge,
          "invalid-target-handle",
          `Invalid flow output handle: ${edge.targetHandle}`,
          targetNode.id,
          edge.targetHandle,
        );
      }
      return undefined;
    }

    addEdgeError(
      edge,
      "invalid-target-handle",
      "Input nodes cannot be edge targets.",
      targetNode.id,
      edge.targetHandle,
    );
    return undefined;
  };

  // Slice edges always target an active node.
  for (const edge of edges) {
    const source = inspectSource(edge, nodeById.get(edge.source));
    if (source?.type === "input" && inputBindings.has(source.handle)) {
      addEdgeError(
        edge,
        "multiple-input-consumers",
        `Flow input handle ${source.handle} can only connect to one node.`,
        edge.source,
        source.handle,
      );
    }
    const targetSchema = inspectTarget(edge, nodeById.get(edge.target)!);
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

    const portEdges = getIncomingEdges(edge.target, edge.targetHandle);
    if (portEdges.length > 1 && portEdges[0] === edge) {
      addEdgeError(
        edge,
        "multiple-input-edges",
        `Multiple edges target ${edge.target}.${edge.targetHandle}.`,
        edge.target,
        edge.targetHandle,
      );
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

  // Only read once inspection is error-free, when every input edge exists.
  const inputEdgesByNodeId = new Map<string, FlowEdgeSpec[]>();
  for (const [nodeId, fnNode] of fnByNodeId) {
    const inputEdges = fnNode.inputSchemas.map((_, index) => {
      const inputEdge = getIncomingEdges(nodeId, index)[0];
      if (!inputEdge) {
        addError({
          code: "missing-input-edge",
          message: `Missing edge for ${nodeId}.${index}.`,
          nodeId,
          handle: index,
        });
      }
      return inputEdge!;
    });
    inputEdgesByNodeId.set(nodeId, inputEdges);
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
