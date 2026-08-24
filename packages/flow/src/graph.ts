import type {
  FlowEdgeSpec,
  FlowFnNodeSpec,
  FlowInputNodeSpec,
  FlowNodeSpec,
  FlowOutputNodeSpec,
  FlowSpec,
} from "./schema.js";

export type FlowIndex = {
  nodeById: Map<string, FlowNodeSpec>;
  inputNodes: FlowInputNodeSpec[];
  outputNodes: FlowOutputNodeSpec[];
  fnNodes: FlowFnNodeSpec[];
  duplicateNodeIds: string[];
  duplicateEdgeIds: string[];
  incomingEdgesByNode: Map<string, FlowEdgeSpec[]>;
};

export const indexFlow = (flow: FlowSpec): FlowIndex => {
  const nodeById = new Map<string, FlowNodeSpec>();
  const duplicateNodeIds: string[] = [];
  for (const node of flow.nodes) {
    if (nodeById.has(node.id)) {
      duplicateNodeIds.push(node.id);
      continue;
    }
    nodeById.set(node.id, node);
  }

  const edgeIds = new Set<string>();
  const duplicateEdgeIds: string[] = [];
  const incomingEdgesByNode = new Map<string, FlowEdgeSpec[]>();
  for (const edge of flow.edges) {
    if (edgeIds.has(edge.id)) {
      duplicateEdgeIds.push(edge.id);
    }
    edgeIds.add(edge.id);

    const edges = incomingEdgesByNode.get(edge.target) ?? [];
    edges.push(edge);
    incomingEdgesByNode.set(edge.target, edges);
  }

  return {
    nodeById,
    inputNodes: flow.nodes.filter((node) => node.type === "input"),
    outputNodes: flow.nodes.filter((node) => node.type === "output"),
    fnNodes: flow.nodes.filter(
      (node): node is FlowFnNodeSpec => node.type === "fn",
    ),
    duplicateNodeIds,
    duplicateEdgeIds,
    incomingEdgesByNode,
  };
};

export const getOutputSlice = (
  flow: FlowSpec,
  index: FlowIndex,
  outputNode: FlowOutputNodeSpec | undefined,
) => {
  const nodeIds = new Set<string>();
  const visitInputs = (nodeId: string) => {
    if (nodeIds.has(nodeId)) {
      return;
    }
    nodeIds.add(nodeId);

    for (const edge of index.incomingEdgesByNode.get(nodeId) ?? []) {
      const sourceNode = index.nodeById.get(edge.source);
      if (sourceNode) {
        visitInputs(sourceNode.id);
      }
    }
  };

  if (outputNode) {
    visitInputs(outputNode.id);
  }

  return {
    nodeIds,
    fnNodes: index.fnNodes.filter((node) => nodeIds.has(node.id)),
    edges: flow.edges.filter((edge) => nodeIds.has(edge.target)),
  };
};

export const orderFnNodes = (
  fnNodes: FlowFnNodeSpec[],
  edges: FlowEdgeSpec[],
) => {
  const fnNodeById = new Map(fnNodes.map((node) => [node.id, node]));
  const outgoing = new Map<string, string[]>();
  const inDegree = new Map(fnNodes.map((node) => [node.id, 0]));

  for (const edge of edges) {
    if (!fnNodeById.has(edge.source) || !fnNodeById.has(edge.target)) {
      continue;
    }
    const targets = outgoing.get(edge.source) ?? [];
    targets.push(edge.target);
    outgoing.set(edge.source, targets);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue = fnNodes.filter((node) => inDegree.get(node.id) === 0);
  const ordered: FlowFnNodeSpec[] = [];
  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index];
    if (!node) {
      continue;
    }
    ordered.push(node);
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

  return {
    nodes: ordered,
    hasCycle: ordered.length !== fnNodes.length,
  };
};
