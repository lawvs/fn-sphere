import { arithmeticFns } from "@fn-sphere/core";
import {
  analyzeFlow,
  compileFlow,
  flowSpecSchema,
  type FlowNodeSpec,
  type FlowSpec,
} from "@fn-sphere/flow";
import {
  addEdge,
  Background,
  Controls,
  ReactFlow,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useState } from "react";
import { FlowCanvasNodeView, type FlowCanvasNode } from "./react-flow-node";

const nodeTypes = { flow: FlowCanvasNodeView } satisfies NodeTypes;

const createNodes = (): FlowCanvasNode[] => [
  {
    id: "input",
    type: "flow",
    position: { x: 0, y: 95 },
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
    position: { x: 210, y: 20 },
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
    position: { x: 420, y: 95 },
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
    position: { x: 630, y: 95 },
    data: {
      flowType: "output",
      label: "Output",
      inputCount: 1,
      outputCount: 0,
    },
  },
];

const createEdges = (): Edge[] => [
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

const numericHandle = (handle: string | null | undefined, edgeId: string) => {
  if (typeof handle !== "string" || !/^(0|[1-9]\d*)$/.test(handle)) {
    throw new Error(`Edge ${edgeId} requires a numeric handle ID.`);
  }
  return Number(handle);
};

const toFlowSpec = (nodes: FlowCanvasNode[], edges: Edge[]): FlowSpec => {
  const flowNodes: FlowNodeSpec[] = nodes.map(({ id, data }) =>
    data.flowType === "fn"
      ? { id, type: "fn", fnName: data.fnName ?? "" }
      : { id, type: data.flowType },
  );

  return flowSpecSchema.parse({
    version: 1,
    name: "formula",
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

type DisplayDiagnostic = {
  severity: "error" | "warning";
  text: string;
};

export function FlowCanvasExample() {
  const [nodes, setNodes, onNodesChange] = useNodesState(createNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(createEdges());
  const [inputs, setInputs] = useState([1, 2, 3]);
  const [result, setResult] = useState<unknown>();
  const [diagnostics, setDiagnostics] = useState<DisplayDiagnostic[]>([]);

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((current) =>
        addEdge({ ...connection, type: "smoothstep" }, current),
      ),
    [setEdges],
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) =>
      setEdges((current) => reconnectEdge(oldEdge, newConnection, current)),
    [setEdges],
  );

  const run = () => {
    try {
      const flow = toFlowSpec(nodes, edges);
      const analysis = analyzeFlow({ flow, fnList: arithmeticFns });
      setDiagnostics(
        analysis.diagnostics.map((diagnostic) => ({
          severity: diagnostic.severity,
          text: `${diagnostic.code}: ${diagnostic.message}`,
        })),
      );
      if (!analysis.valid) {
        setResult(undefined);
        return;
      }

      const compiled = compileFlow({ flow, fnList: arithmeticFns });
      const execute = compiled.define.implement(compiled.implement);
      setResult(execute(...inputs));
    } catch (error) {
      setResult(undefined);
      setDiagnostics([
        {
          severity: "error",
          text:
            error instanceof Error
              ? error.message
              : "Unable to read the graph.",
        },
      ]);
    }
  };

  const hasDiagnosticErrors = diagnostics.some(
    (diagnostic) => diagnostic.severity === "error",
  );

  const reset = () => {
    setNodes(createNodes());
    setEdges(createEdges());
    setResult(undefined);
    setDiagnostics([]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="h-96 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onReconnect={onReconnect}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {inputs.map((value, index) => (
          <label key={index} className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {String.fromCharCode(97 + index)}
            </span>
            <input
              type="number"
              value={value}
              onChange={(event) => {
                const next = [...inputs];
                next[index] = Number(event.currentTarget.value);
                setInputs(next);
              }}
              className="w-24 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
        ))}
        <button
          type="button"
          onClick={run}
          className="rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          Run graph
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Reset graph
        </button>
      </div>

      {result !== undefined && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
          Result: <strong>{String(result)}</strong>
        </div>
      )}
      {diagnostics.length > 0 && (
        <ul
          className={`m-0 rounded-md border px-8 py-3 text-sm ${
            hasDiagnosticErrors
              ? "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
              : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
          }`}
        >
          {diagnostics.map((diagnostic) => (
            <li key={`${diagnostic.severity}:${diagnostic.text}`}>
              {diagnostic.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FlowCanvasExample;
