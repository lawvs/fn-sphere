import {
  Handle,
  Position,
  useUpdateNodeInternals,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { useEffect } from "react";

type FlowCanvasNodeData = {
  flowType: "input" | "fn" | "output";
  label: string;
  fnName?: string;
  inputCount: number;
  outputCount: number;
};

export type FlowCanvasNode = Node<FlowCanvasNodeData, "flow">;

const handleTop = (index: number, count: number) =>
  `${((index + 1) / (count + 1)) * 100}%`;

export function FlowCanvasNodeView({
  id,
  data,
  selected,
}: NodeProps<FlowCanvasNode>) {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [data.inputCount, data.outputCount, id, updateNodeInternals]);

  return (
    <div
      className={`min-w-28 rounded-lg border bg-white px-4 py-3 text-center shadow-sm dark:bg-gray-800 ${
        selected
          ? "border-blue-500 ring-2 ring-blue-200 dark:border-blue-400 dark:ring-blue-900"
          : "border-gray-300 dark:border-gray-600"
      }`}
    >
      {Array.from({ length: data.inputCount }, (_, index) => (
        <Handle
          key={`input-${index}`}
          id={String(index)}
          type="target"
          position={Position.Left}
          style={{ top: handleTop(index, data.inputCount) }}
        />
      ))}
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {data.label}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {data.flowType === "fn" ? data.fnName : data.flowType}
      </div>
      {Array.from({ length: data.outputCount }, (_, index) => (
        <Handle
          key={`output-${index}`}
          id={String(index)}
          type="source"
          position={Position.Right}
          style={{ top: handleTop(index, data.outputCount) }}
        />
      ))}
    </div>
  );
}
