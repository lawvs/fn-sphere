import {
  flowSpecSchema,
  type FlowNodeSpec,
  type FlowSpec,
} from "@fn-sphere/flow";
import type { Edge } from "@xyflow/react";
import type { FlowCanvasNode } from "../flow-example/react-flow-node";

export type ArithmeticOperation = {
  fnName: "add" | "subtract" | "multiply" | "divide";
  label: string;
};

export const arithmeticOperations: readonly ArithmeticOperation[] = [
  { fnName: "add", label: "Add" },
  { fnName: "subtract", label: "Subtract" },
  { fnName: "multiply", label: "Multiply" },
  { fnName: "divide", label: "Divide" },
];

export const createPlaygroundNodes = (): FlowCanvasNode[] => [
  {
    id: "input",
    type: "flow",
    position: { x: 0, y: 130 },
    deletable: false,
    data: {
      flowType: "input",
      label: "Inputs",
      inputCount: 0,
      outputCount: 3,
    },
  },
  {
    id: "sum",
    type: "flow",
    position: { x: 220, y: 50 },
    data: {
      flowType: "fn",
      fnName: "add",
      label: "Add",
      inputCount: 2,
      outputCount: 1,
    },
  },
  {
    id: "product",
    type: "flow",
    position: { x: 440, y: 130 },
    data: {
      flowType: "fn",
      fnName: "multiply",
      label: "Multiply",
      inputCount: 2,
      outputCount: 1,
    },
  },
  {
    id: "output",
    type: "flow",
    position: { x: 660, y: 130 },
    deletable: false,
    data: {
      flowType: "output",
      label: "Output",
      inputCount: 1,
      outputCount: 0,
    },
  },
];

export const createPlaygroundEdges = (): Edge[] => [
  {
    id: "a-to-sum",
    source: "input",
    sourceHandle: "0",
    target: "sum",
    targetHandle: "0",
    type: "smoothstep",
  },
  {
    id: "b-to-sum",
    source: "input",
    sourceHandle: "1",
    target: "sum",
    targetHandle: "1",
    type: "smoothstep",
  },
  {
    id: "sum-to-product",
    source: "sum",
    sourceHandle: "0",
    target: "product",
    targetHandle: "0",
    type: "smoothstep",
  },
  {
    id: "c-to-product",
    source: "input",
    sourceHandle: "2",
    target: "product",
    targetHandle: "1",
    type: "smoothstep",
  },
  {
    id: "product-to-output",
    source: "product",
    sourceHandle: "0",
    target: "output",
    targetHandle: "0",
    type: "smoothstep",
  },
];

export const createFunctionNode = (
  operation: ArithmeticOperation,
  sequence: number,
): FlowCanvasNode => ({
  id: `${operation.fnName}-${sequence}`,
  type: "flow",
  position: {
    x: 220 + ((sequence - 1) % 3) * 190,
    y: 300 + Math.floor((sequence - 1) / 3) * 120,
  },
  data: {
    flowType: "fn",
    fnName: operation.fnName,
    label: operation.label,
    inputCount: 2,
    outputCount: 1,
  },
});

const numericHandle = (handle: string | null | undefined, edgeId: string) => {
  if (typeof handle !== "string" || !/^(0|[1-9]\d*)$/.test(handle)) {
    throw new Error(`Edge ${edgeId} requires a numeric handle ID.`);
  }
  return Number(handle);
};

export const toFlowSpec = (
  name: string,
  nodes: FlowCanvasNode[],
  edges: Edge[],
): FlowSpec => {
  const flowNodes: FlowNodeSpec[] = nodes.map(({ id, data }) =>
    data.flowType === "fn"
      ? { id, type: "fn", fnName: data.fnName ?? "" }
      : { id, type: data.flowType },
  );

  return flowSpecSchema.parse({
    version: 1,
    name,
    nodes: flowNodes,
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      sourceHandle: numericHandle(edge.sourceHandle, edge.id),
      target: edge.target,
      targetHandle: numericHandle(edge.targetHandle, edge.id),
    })),
  });
};

export const getActiveInputCount = (flow: FlowSpec) => {
  const outputNode = flow.nodes.find((node) => node.type === "output");
  if (!outputNode) {
    return 0;
  }

  const nodeById = new Map(flow.nodes.map((node) => [node.id, node]));
  const incomingByNode = new Map<string, typeof flow.edges>();
  for (const edge of flow.edges) {
    const incoming = incomingByNode.get(edge.target) ?? [];
    incoming.push(edge);
    incomingByNode.set(edge.target, incoming);
  }

  const visited = new Set<string>();
  const pending = [outputNode.id];
  let lastInputHandle = -1;
  while (pending.length > 0) {
    const nodeId = pending.pop();
    if (!nodeId || visited.has(nodeId)) {
      continue;
    }
    visited.add(nodeId);

    for (const edge of incomingByNode.get(nodeId) ?? []) {
      const sourceNode = nodeById.get(edge.source);
      if (sourceNode?.type === "input") {
        lastInputHandle = Math.max(lastInputHandle, edge.sourceHandle);
      }
      if (sourceNode) {
        pending.push(sourceNode.id);
      }
    }
  }

  return lastInputHandle + 1;
};
