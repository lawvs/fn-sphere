import { arithmeticFns } from "@fn-sphere/core";
import { analyzeFlow, compileFlow, type FlowDiagnostic } from "@fn-sphere/flow";
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
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlowCanvasNodeView,
  type FlowCanvasNode,
} from "../flow-example/react-flow-node";
import {
  arithmeticOperations,
  createFunctionNode,
  createPlaygroundEdges,
  createPlaygroundNodes,
  getActiveInputCount,
  toFlowSpec,
} from "./model";

const nodeTypes = { flow: FlowCanvasNodeView } satisfies NodeTypes;
const buttonClass =
  "rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700";
const inputClass =
  "rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

type Serialization =
  | { flow: ReturnType<typeof toFlowSpec>; error?: never }
  | { flow?: never; error: string };

type Evaluation =
  | { status: "invalid" }
  | { status: "success"; value: unknown }
  | { status: "error"; message: string };

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unable to process the flow.";

export function FlowPlayground() {
  const [name, setName] = useState("myFormula");
  const [nodes, setNodes, onNodesChange] = useNodesState(
    createPlaygroundNodes(),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    createPlaygroundEdges(),
  );
  const [inputs, setInputs] = useState([1, 2, 3]);
  const nextNodeSequence = useRef(1);

  const inputCount =
    nodes.find((node) => node.data.flowType === "input")?.data.outputCount ?? 0;

  const serialization = useMemo<Serialization>(() => {
    try {
      return { flow: toFlowSpec(name, nodes, edges) };
    } catch (error) {
      return { error: errorMessage(error) };
    }
  }, [edges, name, nodes]);

  const analysis = useMemo(
    () =>
      serialization.flow
        ? analyzeFlow({ flow: serialization.flow, fnList: arithmeticFns })
        : undefined,
    [serialization.flow],
  );

  const evaluation = useMemo<Evaluation>(() => {
    if (!serialization.flow || !analysis?.valid) {
      return { status: "invalid" };
    }

    try {
      const compiled = compileFlow({
        flow: serialization.flow,
        fnList: arithmeticFns,
      });
      const execute = compiled.define.implement(compiled.implement);
      const activeInputCount = getActiveInputCount(serialization.flow);
      return {
        status: "success",
        value: execute(...inputs.slice(0, activeInputCount)),
      };
    } catch (error) {
      return { status: "error", message: errorMessage(error) };
    }
  }, [analysis?.valid, inputs, serialization.flow]);

  const diagnostics: FlowDiagnostic[] = analysis?.diagnostics ?? [];
  const hasErrors =
    Boolean(serialization.error) ||
    diagnostics.some((diagnostic) => diagnostic.severity === "error") ||
    evaluation.status === "error";

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((current) =>
        addEdge({ ...connection, type: "smoothstep" }, current),
      ),
    [setEdges],
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, connection: Connection) =>
      setEdges((current) => reconnectEdge(oldEdge, connection, current)),
    [setEdges],
  );

  const removeEdgesForNodes = useCallback(
    (deletedNodes: FlowCanvasNode[]) => {
      const deletedIds = new Set(deletedNodes.map((node) => node.id));
      setEdges((current) =>
        current.filter(
          (edge) =>
            !deletedIds.has(edge.source) && !deletedIds.has(edge.target),
        ),
      );
    },
    [setEdges],
  );

  const deleteSelected = () => {
    const selectedIds = new Set(
      nodes
        .filter((node) => node.selected && node.data.flowType === "fn")
        .map((node) => node.id),
    );
    if (selectedIds.size === 0) {
      return;
    }
    setNodes((current) => current.filter((node) => !selectedIds.has(node.id)));
    setEdges((current) =>
      current.filter(
        (edge) =>
          !selectedIds.has(edge.source) && !selectedIds.has(edge.target),
      ),
    );
  };

  const setInputCount = (requestedCount: number) => {
    const nextCount = Math.min(8, Math.max(1, requestedCount));
    setNodes((current) =>
      current.map((node) =>
        node.data.flowType === "input"
          ? {
              ...node,
              data: { ...node.data, outputCount: nextCount },
            }
          : node,
      ),
    );
    setEdges((current) =>
      current.filter(
        (edge) =>
          edge.source !== "input" || Number(edge.sourceHandle) < nextCount,
      ),
    );
    setInputs((current) =>
      Array.from(
        { length: nextCount },
        (_, index) => current[index] ?? index + 1,
      ),
    );
  };

  const reset = () => {
    setName("myFormula");
    setNodes(createPlaygroundNodes());
    setEdges(createPlaygroundEdges());
    setInputs([1, 2, 3]);
    nextNodeSequence.current = 1;
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
          <label className="flex min-w-44 flex-1 flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Flow name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              className={inputClass}
            />
          </label>
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Input handles
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Remove input handle"
                disabled={inputCount <= 1}
                onClick={() => setInputCount(inputCount - 1)}
                className={buttonClass}
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold">
                {inputCount}
              </span>
              <button
                type="button"
                aria-label="Add input handle"
                disabled={inputCount >= 8}
                onClick={() => setInputCount(inputCount + 1)}
                className={buttonClass}
              >
                +
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={deleteSelected}
            disabled={
              !nodes.some(
                (node) => node.selected && node.data.flowType === "fn",
              )
            }
            className={buttonClass}
          >
            Delete selected
          </button>
          <button type="button" onClick={reset} className={buttonClass}>
            Reset
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Add node
          </span>
          {arithmeticOperations.map((operation) => (
            <button
              key={operation.fnName}
              type="button"
              onClick={() => {
                const sequence = nextNodeSequence.current;
                nextNodeSequence.current += 1;
                setNodes((current) => [
                  ...current,
                  createFunctionNode(operation, sequence),
                ]);
              }}
              className={buttonClass}
            >
              {operation.label}
            </button>
          ))}
        </div>

        <div className="h-[34rem] overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-950">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodesDelete={removeEdgesForNodes}
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
                input[{index}]
              </span>
              <input
                type="number"
                value={value}
                onChange={(event) => {
                  const next = [...inputs];
                  next[index] = Number(event.currentTarget.value);
                  setInputs(next);
                }}
                className={`${inputClass} w-28`}
              />
            </label>
          ))}
        </div>

        {evaluation.status === "success" && (
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
            Live output: <strong>{String(evaluation.value)}</strong>
          </div>
        )}

        {(serialization.error ||
          diagnostics.length > 0 ||
          evaluation.status === "error") && (
          <ul
            className={`m-0 rounded-md border px-8 py-3 text-sm ${
              hasErrors
                ? "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
                : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
            }`}
          >
            {serialization.error && <li>{serialization.error}</li>}
            {diagnostics.map((diagnostic) => (
              <li
                key={`${diagnostic.severity}:${diagnostic.code}:${diagnostic.nodeId ?? diagnostic.edgeId ?? "flow"}`}
              >
                {diagnostic.severity}: {diagnostic.code} — {diagnostic.message}
              </li>
            ))}
            {evaluation.status === "error" && <li>{evaluation.message}</li>}
          </ul>
        )}
      </section>

      <details className="group min-w-0 overflow-hidden rounded-lg border border-gray-300 bg-gray-950 text-gray-100 dark:border-gray-600">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:content-none">
          <span className="text-sm font-semibold text-white">FlowSpec</span>
          <span className="flex items-center gap-2 text-xs text-gray-400">
            Live JSON
            <span
              aria-hidden="true"
              className="inline-block transition-transform group-open:rotate-180"
            >
              ▾
            </span>
          </span>
        </summary>
        <pre className="m-0 max-h-[36rem] overflow-auto border-t border-gray-800 px-4 py-3 whitespace-pre text-xs leading-5 text-gray-100">
          {serialization.flow
            ? JSON.stringify(serialization.flow, null, 2)
            : serialization.error}
        </pre>
      </details>
    </div>
  );
}

export default FlowPlayground;
