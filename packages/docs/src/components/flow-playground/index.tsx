import {
  addEdge,
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createFunctionNode,
  createPlaygroundEdges,
  createPlaygroundNodes,
  playgroundFns,
  preparePlayground,
  resolveFunctionView,
  runPlayground,
} from "./model";
import { FlowPlaygroundNode, FlowPlaygroundRuntime } from "./node";

const nodeTypes = { flow: FlowPlaygroundNode } satisfies NodeTypes;
const edgeDefaults = {
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { stroke: "#94a3b8", strokeWidth: 1.7 },
};
const buttonClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";
const inputClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

const getColorMode = () =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

function useColorMode() {
  const [colorMode, setColorMode] = useState<"light" | "dark">(getColorMode);

  useEffect(() => {
    const updateColorMode = () => setColorMode(getColorMode());
    const observer = new MutationObserver(updateColorMode);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return colorMode;
}

export function FlowPlayground() {
  const colorMode = useColorMode();
  const [name, setName] = useState("myFormula");
  const [nodes, setNodes, onNodesChange] = useNodesState(
    createPlaygroundNodes(),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    createPlaygroundEdges(),
  );
  const [inputs, setInputs] = useState([1, 2, 3]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [functionQuery, setFunctionQuery] = useState("");
  const nextNodeSequence = useRef(1);

  const inputCount = inputs.length;
  const prepared = useMemo(
    () => preparePlayground(name, nodes, edges),
    [edges, name, nodes],
  );
  const result = useMemo(
    () => runPlayground(prepared, inputs),
    [inputs, prepared],
  );

  const diagnostics = result.diagnostics;
  const error = "error" in result ? result.error : undefined;
  const errorCount =
    Number(Boolean(error)) +
    diagnostics.filter((diagnostic) => diagnostic.severity === "error").length;
  const warningCount = diagnostics.filter(
    (diagnostic) => diagnostic.severity === "warning",
  ).length;
  const hasErrors = errorCount > 0;

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((current) =>
        addEdge(
          { ...connection, ...edgeDefaults },
          current.filter(
            (edge) =>
              edge.target !== connection.target ||
              edge.targetHandle !== connection.targetHandle,
          ),
        ),
      ),
    [setEdges],
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, connection: Connection) =>
      setEdges((current) => reconnectEdge(oldEdge, connection, current)),
    [setEdges],
  );

  const setInputValue = useCallback((index: number, value: number) => {
    setInputs((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }, []);

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

  const visibleFunctions = playgroundFns
    .map(({ name: fnName }) => ({
      fnName,
      view: resolveFunctionView(fnName),
    }))
    .filter(({ fnName, view }) =>
      (fnName + " " + view.title)
        .toLowerCase()
        .includes(functionQuery.trim().toLowerCase()),
    );

  const addFunction = (fnName: string) => {
    const sequence = nextNodeSequence.current;
    nextNodeSequence.current += 1;
    setNodes((current) => [...current, createFunctionNode(fnName, sequence)]);
    setDrawerOpen(false);
  };

  const reset = () => {
    setName("myFormula");
    setNodes(createPlaygroundNodes());
    setEdges(createPlaygroundEdges());
    setInputs([1, 2, 3]);
    setDrawerOpen(false);
    setFunctionQuery("");
    nextNodeSequence.current = 1;
  };

  const statusValue =
    result.status === "success"
      ? String(result.value)
      : result.status === "error"
        ? "Error"
        : "Not runnable";
  const nodeOutput = result.status === "invalid" ? "—" : statusValue;

  return (
    <FlowPlaygroundRuntime.Provider
      value={{ inputs, output: nodeOutput, setInputValue }}
    >
      <div className="flex flex-col gap-4">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/80">
            <label className="flex min-w-48 flex-1 flex-col gap-1.5 text-sm">
              <span className="text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Flow name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                className={inputClass}
              />
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={inputCount <= 1}
                onClick={() => setInputCount(inputCount - 1)}
                className={buttonClass}
              >
                − Input
              </button>
              <span className="min-w-8 text-center text-sm font-bold text-slate-600 dark:text-slate-300">
                {inputCount}
              </span>
              <button
                type="button"
                disabled={inputCount >= 8}
                onClick={() => setInputCount(inputCount + 1)}
                className={buttonClass}
              >
                + Input
              </button>
            </div>
            <button type="button" onClick={reset} className={buttonClass}>
              Reset
            </button>
          </div>

          <div className="relative h-[36rem] bg-slate-50 dark:bg-slate-950">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              colorMode={colorMode}
              proOptions={{ hideAttribution: true }}
              defaultEdgeOptions={edgeDefaults}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onReconnect={onReconnect}
              onPaneClick={() => setDrawerOpen(false)}
              fitView
            >
              <Background color="#cbd5e1" gap={20} size={1} />
              <Controls />
            </ReactFlow>
            {!drawerOpen && (
              <button
                type="button"
                aria-expanded="false"
                onClick={() => setDrawerOpen(true)}
                className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-xl border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <span aria-hidden="true">☰</span>
                Functions
              </button>
            )}
            {drawerOpen && (
              <aside className="absolute top-4 bottom-4 left-4 z-30 flex w-72 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.14em] text-blue-500 uppercase">
                      Add to canvas
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      Function drawer
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Close function drawer"
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-lg bg-transparent px-2 py-1 text-xl text-slate-400 transition hover:bg-slate-100 dark:bg-transparent dark:hover:bg-slate-800"
                  >
                    ×
                  </button>
                </div>
                <div className="p-3">
                  <input
                    autoFocus
                    aria-label="Search functions"
                    placeholder="Search functions…"
                    value={functionQuery}
                    onChange={(event) =>
                      setFunctionQuery(event.currentTarget.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
                  {visibleFunctions.map(({ fnName, view }) => (
                    <button
                      key={fnName}
                      type="button"
                      onClick={() => addFunction(fnName)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-blue-950/30"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {view.title}
                        </span>
                        <span className="text-lg text-blue-500">+</span>
                      </span>
                      <span className="mt-1 block font-mono text-[10px] text-slate-400">
                        {view.inputs.map((input) => input.type).join(", ")} →{" "}
                        {view.output.type}
                      </span>
                    </button>
                  ))}
                  {visibleFunctions.length === 0 && (
                    <p className="px-3 py-6 text-center text-sm text-slate-400">
                      No matching functions
                    </p>
                  )}
                </div>
              </aside>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <span>
              Output{" "}
              <strong className="text-sm text-slate-900 dark:text-white">
                {statusValue}
              </strong>
            </span>
            <span>{nodes.length} nodes</span>
            <span>{edges.length} edges</span>
            <span
              className={
                hasErrors
                  ? "font-semibold text-red-600 dark:text-red-400"
                  : "text-slate-400"
              }
            >
              {errorCount} errors
            </span>
            <span
              className={
                warningCount > 0
                  ? "font-semibold text-amber-600 dark:text-amber-400"
                  : "text-slate-400"
              }
            >
              {warningCount} warnings
            </span>
          </div>
        </section>

        {(error || diagnostics.length > 0) && (
          <ul
            className={`m-0 rounded-xl border px-8 py-3 text-sm ${
              hasErrors
                ? "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
                : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
            }`}
          >
            {error && <li>{error}</li>}
            {diagnostics.map((diagnostic) => (
              <li
                key={`${diagnostic.severity}:${diagnostic.code}:${diagnostic.nodeId ?? diagnostic.edgeId ?? "flow"}`}
              >
                {diagnostic.severity}: {diagnostic.code} — {diagnostic.message}
              </li>
            ))}
          </ul>
        )}

        <details className="group min-w-0 overflow-hidden rounded-xl border border-slate-300 bg-slate-950 text-slate-100 dark:border-slate-600">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:content-none">
            <span className="text-sm font-semibold text-white">FlowSpec</span>
            <span className="flex items-center gap-2 text-xs text-slate-400">
              Live JSON
              <span
                aria-hidden="true"
                className="inline-block transition-transform group-open:rotate-180"
              >
                ▾
              </span>
            </span>
          </summary>
          <pre className="m-0 max-h-[36rem] overflow-auto border-t border-slate-800 px-4 py-3 whitespace-pre text-xs leading-5 text-slate-100">
            {result.flow ? JSON.stringify(result.flow, null, 2) : error}
          </pre>
        </details>
      </div>
    </FlowPlaygroundRuntime.Provider>
  );
}

export default FlowPlayground;
