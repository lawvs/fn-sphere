import {
  arithmeticFns,
  logicFns,
  type StandardFnSchema,
} from "@fn-sphere/core";
import {
  flowSpecSchema,
  tryCompileFlow,
  type FlowDiagnostic,
  type FlowNodeSpec,
  type FlowSpec,
} from "@fn-sphere/flow";
import type { Edge, Node } from "@xyflow/react";
import { z } from "zod";
import type { $ZodTuple, $ZodType } from "zod/v4/core";

type PlaygroundNodeData =
  | { flowType: "input"; outputCount: number }
  | { flowType: "fn"; fnName: string }
  | { flowType: "output" };

export type PlaygroundNode = Node<PlaygroundNodeData, "flow">;

export const playgroundFns: readonly StandardFnSchema[] = [
  ...arithmeticFns,
  ...logicFns,
];

type FlowFunctionPortView = {
  label: string;
  type: string;
};

type FlowFunctionView = {
  title: string;
  inputs: FlowFunctionPortView[];
  output: FlowFunctionPortView;
};

const descriptionOr = (schema: $ZodType, fallback: string) => {
  const description = z.globalRegistry.get(schema)?.description?.trim();
  return description || fallback;
};

const schemaType = (schema: $ZodType) => schema._zod.def.type || "value";

export const resolveFunctionView = (
  fnName: string | undefined,
): FlowFunctionView => {
  const fallbackName = fnName || "function";
  const fn = playgroundFns.find((candidate) => candidate.name === fallbackName);
  if (!fn) {
    return {
      title: fallbackName,
      inputs: [],
      output: { label: "output", type: "value" },
    };
  }

  const input = fn.define._zod.def.input;
  const inputSchemas =
    input._zod.def.type === "tuple"
      ? ((input as $ZodTuple)._zod.def.items as $ZodType[])
      : [];
  const outputSchema = fn.define._zod.def.output as $ZodType;

  return {
    title: descriptionOr(fn.define, fn.name),
    inputs: inputSchemas.map((schema, index) => ({
      label: descriptionOr(schema, `input[${index}]`),
      type: schemaType(schema),
    })),
    output: {
      label: descriptionOr(outputSchema, "output"),
      type: schemaType(outputSchema),
    },
  };
};

export const createPlaygroundNodes = (): PlaygroundNode[] => [
  {
    id: "input",
    type: "flow",
    position: { x: 0, y: 130 },
    deletable: false,
    data: {
      flowType: "input",
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
    },
  },
  {
    id: "product",
    type: "flow",
    position: { x: 440, y: 130 },
    data: {
      flowType: "fn",
      fnName: "multiply",
    },
  },
  {
    id: "output",
    type: "flow",
    position: { x: 660, y: 130 },
    deletable: false,
    data: {
      flowType: "output",
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
  fnName: string,
  sequence: number,
): PlaygroundNode => ({
  id: `${fnName}-${sequence}`,
  type: "flow",
  position: {
    x: 220 + ((sequence - 1) % 3) * 190,
    y: 300 + Math.floor((sequence - 1) / 3) * 120,
  },
  data: { flowType: "fn", fnName },
});

const numericHandle = (handle: string | null | undefined, edgeId: string) => {
  if (typeof handle !== "string" || !/^(0|[1-9]\d*)$/.test(handle)) {
    throw new Error(`Edge ${edgeId} requires a numeric handle ID.`);
  }
  return Number(handle);
};

const toFlowSpec = (
  name: string,
  nodes: PlaygroundNode[],
  edges: Edge[],
): FlowSpec => {
  const flowNodes: FlowNodeSpec[] = nodes.map(({ id, data }) =>
    data.flowType === "fn"
      ? { id, type: "fn", fnName: data.fnName }
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

type PlaygroundContext = {
  flow: FlowSpec;
  diagnostics: FlowDiagnostic[];
};

type InvalidPlayground = {
  status: "invalid";
  flow: FlowSpec | undefined;
  diagnostics: FlowDiagnostic[];
  error?: string;
};

type PreparedPlayground =
  | InvalidPlayground
  | (PlaygroundContext & {
      status: "ready";
      execute: (inputs: number[]) => unknown;
    });

type PlaygroundResult =
  | InvalidPlayground
  | (PlaygroundContext &
      (
        | { status: "success"; value: unknown }
        | { status: "error"; error: string }
      ));

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unable to process the flow.";

export const preparePlayground = (
  name: string,
  nodes: PlaygroundNode[],
  edges: Edge[],
): PreparedPlayground => {
  let flow: FlowSpec | undefined;
  try {
    flow = toFlowSpec(name, nodes, edges);
    const result = tryCompileFlow({ flow, fnList: playgroundFns });
    if (!result.valid) {
      return { flow, diagnostics: result.diagnostics, status: "invalid" };
    }

    const { compiled } = result;
    const execute = compiled.define.implement(compiled.implement);
    const inputCount = compiled.define._zod.def.input._zod.def.items.length;
    return {
      flow,
      diagnostics: result.diagnostics,
      status: "ready",
      execute: (inputs) => execute(...inputs.slice(0, inputCount)),
    };
  } catch (error) {
    return {
      flow,
      diagnostics: [],
      status: "invalid",
      error: errorMessage(error),
    };
  }
};

export const runPlayground = (
  prepared: PreparedPlayground,
  inputs: number[],
): PlaygroundResult => {
  if (prepared.status === "invalid") {
    return prepared;
  }

  const { flow, diagnostics } = prepared;
  try {
    return {
      flow,
      diagnostics,
      status: "success",
      value: prepared.execute(inputs),
    };
  } catch (error) {
    return {
      flow,
      diagnostics,
      status: "error",
      error: errorMessage(error),
    };
  }
};
