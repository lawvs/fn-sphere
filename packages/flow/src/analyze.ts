import type { StandardFnSchema } from "@fn-sphere/core";
import { isCompatibleType } from "zod-compare";
import type { $ZodTuple, $ZodType } from "zod/v4/core";
import type { FlowEdgeSpec, FlowFnNodeSpec, FlowNodeSpec } from "./schema.js";
import type { FlowAnalysis, FlowDiagnostic, FlowSchema } from "./types.js";

type InspectFlowOptions = {
  flow: FlowSchema;
  fnList: readonly StandardFnSchema[];
};

export type InspectedFlow = {
  analysis: FlowAnalysis;
  fnByNodeId: Map<string, StandardFnSchema>;
  inputSchemasByNodeId: Map<string, $ZodType[]>;
  incomingEdges: Map<string, FlowEdgeSpec[]>;
  nodeById: Map<string, FlowNodeSpec>;
  orderedFnNodes: FlowFnNodeSpec[];
};

const inputKey = (nodeId: string, handle: string) => `${nodeId}\0${handle}`;

const parseIndexHandle = (handle: string) => {
  if (!/^(0|[1-9]\d*)$/.test(handle)) {
    return undefined;
  }
  return Number(handle);
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

const getOutputSchema = (fnSchema: Pick<StandardFnSchema, "define">) =>
  fnSchema.define._zod.def.output;

export const inspectFlow = ({
  flow,
  fnList,
}: InspectFlowOptions): InspectedFlow => {
  const diagnostics: FlowDiagnostic[] = [];
  const addDiagnostic = (diagnostic: FlowDiagnostic) => {
    diagnostics.push(diagnostic);
  };

  const nodeById = new Map<string, FlowNodeSpec>();
  for (const node of flow.flow.nodes) {
    if (nodeById.has(node.id)) {
      addDiagnostic({
        code: "duplicate-node-id",
        message: `Duplicate node id: ${node.id}`,
        nodeId: node.id,
      });
      continue;
    }
    nodeById.set(node.id, node);
  }

  const edgeIds = new Set<string>();
  for (const edge of flow.flow.edges) {
    if (edgeIds.has(edge.id)) {
      addDiagnostic({
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
      addDiagnostic({
        code: "duplicate-function-name",
        message: `Duplicate function name: ${fnSchema.name}`,
      });
      continue;
    }
    fnByName.set(fnSchema.name, fnSchema);
  }

  const inputNodes = flow.flow.nodes.filter((node) => node.type === "input");
  if (inputNodes.length === 0) {
    addDiagnostic({
      code: "missing-input-node",
      message: "Flow requires one input node.",
    });
  } else if (inputNodes.length > 1) {
    addDiagnostic({
      code: "multiple-input-nodes",
      message: "Flow requires exactly one input node.",
    });
  }

  const outputNodes = flow.flow.nodes.filter((node) => node.type === "output");
  if (outputNodes.length === 0) {
    addDiagnostic({
      code: "missing-output-node",
      message: "Flow requires one output node.",
    });
  } else if (outputNodes.length > 1) {
    addDiagnostic({
      code: "multiple-output-nodes",
      message: "Flow requires exactly one output node.",
    });
  }

  const fnNodes = flow.flow.nodes.filter(
    (node): node is FlowFnNodeSpec => node.type === "fn",
  );
  const fnByNodeId = new Map<string, StandardFnSchema>();
  const inputSchemasByNodeId = new Map<string, $ZodType[]>();
  for (const node of fnNodes) {
    const fnSchema = fnByName.get(node.fnName);
    if (!fnSchema) {
      addDiagnostic({
        code: "unknown-function",
        message: `Unknown function: ${node.fnName}`,
        nodeId: node.id,
      });
      continue;
    }
    const inputSchemas = getInputSchemas(fnSchema);
    if (!inputSchemas) {
      addDiagnostic({
        code: "unsupported-function-input",
        message: `Function ${node.fnName} must use a fixed tuple input schema.`,
        nodeId: node.id,
      });
      continue;
    }
    fnByNodeId.set(node.id, fnSchema);
    inputSchemasByNodeId.set(node.id, inputSchemas);
  }

  const flowInputSchemas = getInputSchemas(flow);
  if (!flowInputSchemas) {
    addDiagnostic({
      code: "unsupported-function-input",
      message: "Flow must use a fixed tuple input schema.",
    });
  }
  const flowOutputSchema = getOutputSchema(flow);
  const incomingEdges = new Map<string, FlowEdgeSpec[]>();
  const sourceSchemas = new Map<string, $ZodType>();
  const targetSchemas = new Map<string, $ZodType>();

  for (const edge of flow.flow.edges) {
    const sourceNode = nodeById.get(edge.source);
    const targetNode = nodeById.get(edge.target);

    if (!sourceNode) {
      addDiagnostic({
        code: "unknown-source-node",
        message: `Unknown source node: ${edge.source}`,
        edgeId: edge.id,
        nodeId: edge.source,
      });
    } else if (sourceNode.type === "input") {
      const index = parseIndexHandle(edge.sourceHandle);
      if (index === undefined) {
        addDiagnostic({
          code: "invalid-source-handle",
          message: `Invalid input handle: ${edge.sourceHandle}`,
          edgeId: edge.id,
          nodeId: sourceNode.id,
          handle: edge.sourceHandle,
        });
      } else if (flowInputSchemas) {
        const sourceSchema = flowInputSchemas[index];
        if (sourceSchema) {
          sourceSchemas.set(edge.id, sourceSchema);
        } else {
          addDiagnostic({
            code: "invalid-source-handle",
            message: `Invalid input handle: ${edge.sourceHandle}`,
            edgeId: edge.id,
            nodeId: sourceNode.id,
            handle: edge.sourceHandle,
          });
        }
      }
    } else if (sourceNode.type === "fn") {
      const fnSchema = fnByNodeId.get(sourceNode.id);
      if (edge.sourceHandle !== "output" || !fnSchema) {
        if (edge.sourceHandle !== "output") {
          addDiagnostic({
            code: "invalid-source-handle",
            message: `Invalid function output handle: ${edge.sourceHandle}`,
            edgeId: edge.id,
            nodeId: sourceNode.id,
            handle: edge.sourceHandle,
          });
        }
      } else {
        sourceSchemas.set(edge.id, getOutputSchema(fnSchema));
      }
    } else {
      addDiagnostic({
        code: "invalid-source-handle",
        message: "Output nodes cannot be edge sources.",
        edgeId: edge.id,
        nodeId: sourceNode.id,
        handle: edge.sourceHandle,
      });
    }

    if (!targetNode) {
      addDiagnostic({
        code: "unknown-target-node",
        message: `Unknown target node: ${edge.target}`,
        edgeId: edge.id,
        nodeId: edge.target,
      });
      continue;
    }

    if (targetNode.type === "fn") {
      const fnSchema = fnByNodeId.get(targetNode.id);
      const index = parseIndexHandle(edge.targetHandle);
      if (index === undefined) {
        addDiagnostic({
          code: "invalid-target-handle",
          message: `Invalid function input handle: ${edge.targetHandle}`,
          edgeId: edge.id,
          nodeId: targetNode.id,
          handle: edge.targetHandle,
        });
      } else if (fnSchema) {
        const targetSchema = inputSchemasByNodeId.get(targetNode.id)?.[index];
        if (targetSchema) {
          targetSchemas.set(edge.id, targetSchema);
        } else {
          addDiagnostic({
            code: "invalid-target-handle",
            message: `Invalid function input handle: ${edge.targetHandle}`,
            edgeId: edge.id,
            nodeId: targetNode.id,
            handle: edge.targetHandle,
          });
        }
      }
    } else if (targetNode.type === "output") {
      if (edge.targetHandle !== "input") {
        addDiagnostic({
          code: "invalid-target-handle",
          message: `Invalid flow output handle: ${edge.targetHandle}`,
          edgeId: edge.id,
          nodeId: targetNode.id,
          handle: edge.targetHandle,
        });
      } else {
        targetSchemas.set(edge.id, flowOutputSchema);
      }
    } else {
      addDiagnostic({
        code: "invalid-target-handle",
        message: "Input nodes cannot be edge targets.",
        edgeId: edge.id,
        nodeId: targetNode.id,
        handle: edge.targetHandle,
      });
    }

    const key = inputKey(edge.target, edge.targetHandle);
    const edges = incomingEdges.get(key) ?? [];
    edges.push(edge);
    incomingEdges.set(key, edges);
  }

  for (const [key, edges] of incomingEdges) {
    if (edges.length < 2) {
      continue;
    }
    const edge = edges[0];
    if (!edge) {
      continue;
    }
    addDiagnostic({
      code: "multiple-input-edges",
      message: `Multiple edges target ${edge.target}.${edge.targetHandle}.`,
      nodeId: edge.target,
      edgeId: edge.id,
      handle: edge.targetHandle,
    });
  }

  for (const node of fnNodes) {
    const inputSchemas = inputSchemasByNodeId.get(node.id);
    if (!inputSchemas) {
      continue;
    }
    inputSchemas.forEach((_, index) => {
      const handle = String(index);
      if (!incomingEdges.has(inputKey(node.id, handle))) {
        addDiagnostic({
          code: "missing-input-edge",
          message: `Missing edge for ${node.id}.${handle}.`,
          nodeId: node.id,
          handle,
        });
      }
    });
  }

  const outputNode = outputNodes.length === 1 ? outputNodes[0] : undefined;
  if (outputNode && !incomingEdges.has(inputKey(outputNode.id, "input"))) {
    addDiagnostic({
      code: "missing-input-edge",
      message: `Missing edge for ${outputNode.id}.input.`,
      nodeId: outputNode.id,
      handle: "input",
    });
  }

  for (const edge of flow.flow.edges) {
    const sourceSchema = sourceSchemas.get(edge.id);
    const targetSchema = targetSchemas.get(edge.id);
    if (
      sourceSchema &&
      targetSchema &&
      !isCompatibleType(targetSchema, sourceSchema)
    ) {
      addDiagnostic({
        code: "incompatible-edge",
        message: `Incompatible edge: ${edge.id}`,
        edgeId: edge.id,
      });
    }
  }

  const fnNodeById = new Map(fnNodes.map((node) => [node.id, node]));
  const outgoing = new Map<string, string[]>();
  const inDegree = new Map(fnNodes.map((node) => [node.id, 0]));
  for (const edge of flow.flow.edges) {
    if (!fnNodeById.has(edge.source) || !fnNodeById.has(edge.target)) {
      continue;
    }
    const targets = outgoing.get(edge.source) ?? [];
    targets.push(edge.target);
    outgoing.set(edge.source, targets);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue = fnNodes.filter((node) => inDegree.get(node.id) === 0);
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

  if (orderedFnNodes.length !== fnNodes.length) {
    addDiagnostic({
      code: "cycle",
      message: "Flow contains a cycle.",
    });
  }

  return {
    analysis: {
      valid: diagnostics.length === 0,
      diagnostics,
    },
    fnByNodeId,
    inputSchemasByNodeId,
    incomingEdges,
    nodeById,
    orderedFnNodes,
  };
};

export const analyzeFlow = (options: InspectFlowOptions): FlowAnalysis =>
  inspectFlow(options).analysis;

export const getFlowInputKey = inputKey;
