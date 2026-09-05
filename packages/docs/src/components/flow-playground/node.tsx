import {
  Handle,
  Position,
  useUpdateNodeInternals,
  type NodeProps,
} from "@xyflow/react";
import { createContext, useContext, useEffect } from "react";
import { resolveFunctionView, type PlaygroundNode } from "./model";

type FlowPlaygroundRuntime = {
  inputs: number[];
  output: string;
  setInputValue: (index: number, value: number) => void;
};

export const FlowPlaygroundRuntime =
  createContext<FlowPlaygroundRuntime | null>(null);

const useRuntime = () => {
  const runtime = useContext(FlowPlaygroundRuntime);
  if (!runtime) {
    throw new Error("Flow playground node rendered outside its provider.");
  }
  return runtime;
};

function PortHandle({
  id,
  type,
  position,
  accent = "#2563eb",
  contained = false,
}: {
  id: string;
  type: "source" | "target";
  position: Position;
  accent?: string;
  contained?: boolean;
}) {
  return (
    <Handle
      id={id}
      type={type}
      position={position}
      style={{
        width: 11,
        height: 11,
        border: "2px solid white",
        background: accent,
        ...(contained && position === Position.Left ? { left: 12 } : {}),
      }}
    />
  );
}

export function FlowPlaygroundNode({
  id,
  data,
  selected,
}: NodeProps<PlaygroundNode>) {
  const { inputs, output, setInputValue } = useRuntime();
  const updateNodeInternals = useUpdateNodeInternals();
  const dynamicOutputCount = data.flowType === "input" ? data.outputCount : 0;

  useEffect(() => {
    updateNodeInternals(id);
  }, [dynamicOutputCount, id, updateNodeInternals]);

  const selectedClass = selected
    ? "border-blue-500 shadow-lg ring-4 ring-blue-500/10"
    : "border-slate-200 shadow-md dark:border-slate-700";

  if (data.flowType === "input") {
    return (
      <div
        className={`w-56 overflow-hidden rounded-xl border bg-white text-left dark:bg-slate-900 ${selectedClass}`}
      >
        <div className="bg-violet-50 px-4 py-2.5 dark:bg-violet-950/60">
          <div className="text-[10px] font-bold tracking-[0.16em] text-violet-600 uppercase dark:text-violet-300">
            Flow input
          </div>
          <div className="font-semibold text-slate-900 dark:text-white">
            Inputs
          </div>
        </div>
        <div className="divide-y divide-slate-100 px-3 dark:divide-slate-800">
          {Array.from({ length: data.outputCount }, (_, index) => (
            <div
              key={index}
              className="relative flex h-11 items-center gap-2 pr-3 text-xs"
            >
              <span className="w-16 font-medium text-slate-500 dark:text-slate-400">
                input[{index}]
              </span>
              <input
                aria-label={`input ${index}`}
                type="number"
                value={inputs[index] ?? 0}
                onChange={(event) =>
                  setInputValue(index, Number(event.currentTarget.value))
                }
                className="nodrag nowheel min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-right font-mono text-slate-900 outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <PortHandle
                id={String(index)}
                type="source"
                position={Position.Right}
                accent="#7c3aed"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.flowType === "output") {
    return (
      <div
        className={`w-48 overflow-hidden rounded-xl border bg-white text-left dark:bg-slate-900 ${selectedClass}`}
      >
        <div className="bg-emerald-50 px-4 py-2.5 dark:bg-emerald-950/60">
          <div className="text-[10px] font-bold tracking-[0.16em] text-emerald-600 uppercase dark:text-emerald-300">
            Flow output
          </div>
          <div className="font-semibold text-slate-900 dark:text-white">
            Result
          </div>
        </div>
        <div className="relative flex min-h-16 items-center px-4 pl-5">
          <PortHandle
            id="0"
            type="target"
            position={Position.Left}
            accent="#059669"
            contained
          />
          <span className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
            {output}
          </span>
        </div>
      </div>
    );
  }

  const functionView = resolveFunctionView(data.fnName);

  return (
    <div
      className={`w-52 overflow-hidden rounded-xl border bg-white text-left dark:bg-slate-900 ${selectedClass}`}
    >
      <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
        <div className="text-[10px] font-bold tracking-[0.16em] text-blue-600 uppercase dark:text-blue-300">
          Function
        </div>
        <div className="font-semibold text-slate-900 dark:text-white">
          {functionView.title}
        </div>
      </div>
      <div className="divide-y divide-slate-100 px-3 dark:divide-slate-800">
        {functionView.inputs.map((input, index) => (
          <div
            key={index}
            className="relative flex h-9 items-center justify-between pl-3 text-xs"
          >
            <PortHandle
              id={String(index)}
              type="target"
              position={Position.Left}
            />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {input.label}
            </span>
            <span className="text-slate-400">{input.type}</span>
          </div>
        ))}
        <div className="relative flex h-9 items-center justify-between pr-3 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {functionView.output.label}
          </span>
          <span className="text-slate-400">{functionView.output.type}</span>
          <PortHandle id="0" type="source" position={Position.Right} />
        </div>
      </div>
    </div>
  );
}
