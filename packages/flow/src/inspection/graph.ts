import type {
  FlowEdgeSpec,
  FlowFnNodeSpec,
  FlowNodeSpec,
  FlowSpec,
} from "../schema.js";

export const indexFlow = (flow: FlowSpec) => {
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
  const incomingEdges = new Map<string, Map<number, FlowEdgeSpec[]>>();
  for (const edge of flow.edges) {
    if (edgeIds.has(edge.id)) {
      duplicateEdgeIds.push(edge.id);
    }
    edgeIds.add(edge.id);

    const edgesByHandle =
      incomingEdges.get(edge.target) ?? new Map<number, FlowEdgeSpec[]>();
    const edges = edgesByHandle.get(edge.targetHandle) ?? [];
    edges.push(edge);
    edgesByHandle.set(edge.targetHandle, edges);
    incomingEdges.set(edge.target, edgesByHandle);
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
    incomingEdges,
  };
};

type FlowIndex = ReturnType<typeof indexFlow>;

export const getOutputSlice = (flow: FlowSpec, index: FlowIndex) => {
  const outputNode =
    index.outputNodes.length === 1 ? index.outputNodes[0] : undefined;
  const nodeById = new Map<string, FlowNodeSpec>();
  const visitInputs = (nodeId: string) => {
    const node = index.nodeById.get(nodeId);
    if (!node || nodeById.has(nodeId)) {
      return;
    }
    nodeById.set(nodeId, node);

    for (const edges of index.incomingEdges.get(nodeId)?.values() ?? []) {
      for (const edge of edges) {
        visitInputs(edge.source);
      }
    }
  };

  if (outputNode) {
    visitInputs(outputNode.id);
  }

  return {
    inputNode: index.inputNodes[0],
    outputNode,
    nodeById,
    fnNodes: index.fnNodes.filter((node) => nodeById.has(node.id)),
    edges: flow.edges.filter((edge) => nodeById.has(edge.target)),
    // All incoming edges of an active target belong to the output slice.
    getIncomingEdges: (nodeId: string, handle: number): FlowEdgeSpec[] =>
      nodeById.has(nodeId)
        ? (index.incomingEdges.get(nodeId)?.get(handle) ?? [])
        : [],
  };
};

export type ActiveFlow = ReturnType<typeof getOutputSlice>;

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
  const orderedNodes: FlowFnNodeSpec[] = [];
  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index]!;
    orderedNodes.push(node);
    for (const targetId of outgoing.get(node.id) ?? []) {
      const nextDegree = (inDegree.get(targetId) ?? 0) - 1;
      inDegree.set(targetId, nextDegree);
      if (nextDegree === 0) {
        queue.push(fnNodeById.get(targetId)!);
      }
    }
  }

  return orderedNodes;
};
