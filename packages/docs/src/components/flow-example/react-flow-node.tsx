import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

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

export function FlowCanvasNodeView({ data }: NodeProps<FlowCanvasNode>) {
  return (
    <div className="min-w-28 rounded-lg border border-gray-300 bg-white px-4 py-3 text-center shadow-sm dark:border-gray-600 dark:bg-gray-800">
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
