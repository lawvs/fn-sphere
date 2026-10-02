import type {
  FlowEdgeSpec,
  FlowFnNodeSpec,
  FlowNodeSpec,
  FlowSpec,
} from "../schema.js";

// Keeps the first item per key and reports every later repeat.
export const indexUnique = <T>(
  items: readonly T[],
  getKey: (item: T) => string,
) => {
  const byKey = new Map<string, T>();
  const duplicates: string[] = [];
  for (const item of items) {
    const key = getKey(item);
    if (byKey.has(key)) {
      duplicates.push(key);
      continue;
    }
    byKey.set(key, item);
  }
  return { byKey, duplicates };
};

export const indexFlow = (flow: FlowSpec) => {
  const { byKey: nodeById, duplicates: duplicateNodeIds } = indexUnique(
    flow.nodes,
    (node) => node.id,
  );
  const { duplicates: duplicateEdgeIds } = indexUnique(
    flow.edges,
    (edge) => edge.id,
  );

  const inputNodes: FlowNodeSpec[] = [];
  const outputNodes: FlowNodeSpec[] = [];
  const fnNodes: FlowFnNodeSpec[] = [];
  for (const node of flow.nodes) {
    if (node.type === "input") inputNodes.push(node);
    else if (node.type === "output") outputNodes.push(node);
    else fnNodes.push(node);
  }

  const incomingEdges = new Map<string, Map<number, FlowEdgeSpec[]>>();
  for (const edge of flow.edges) {
    const edgesByHandle =
      incomingEdges.get(edge.target) ?? new Map<number, FlowEdgeSpec[]>();
    const edges = edgesByHandle.get(edge.targetHandle) ?? [];
    edges.push(edge);
    edgesByHandle.set(edge.targetHandle, edges);
    incomingEdges.set(edge.target, edgesByHandle);
  }

  return {
    nodeById,
    edges: flow.edges,
    inputNodes,
    outputNodes,
    fnNodes,
    duplicateNodeIds,
    duplicateEdgeIds,
    incomingEdges,
  };
};

type FlowIndex = ReturnType<typeof indexFlow>;

export const getOutputSlice = (index: FlowIndex) => {
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
    // All incoming edges of an active target belong to the output slice.
    edges: index.edges.filter((edge) => nodeById.has(edge.target)),
    getIncomingEdges: (nodeId: string, handle: number): FlowEdgeSpec[] =>
      index.incomingEdges.get(nodeId)?.get(handle) ?? [],
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
    inDegree.set(edge.target, inDegree.get(edge.target)! + 1);
  }

  const queue = fnNodes.filter((node) => inDegree.get(node.id) === 0);
  const orderedNodes: FlowFnNodeSpec[] = [];
  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index]!;
    orderedNodes.push(node);
    for (const targetId of outgoing.get(node.id) ?? []) {
      const nextDegree = inDegree.get(targetId)! - 1;
      inDegree.set(targetId, nextDegree);
      if (nextDegree === 0) {
        queue.push(fnNodeById.get(targetId)!);
      }
    }
  }

  return orderedNodes;
};
