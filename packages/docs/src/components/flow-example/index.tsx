import { arithmeticFns } from "@fn-sphere/core";
import { compileFlow, type FlowSpec } from "@fn-sphere/flow";
import { useMemo, useState } from "react";

const formula = {
  version: 1,
  name: "formula",
  nodes: [
    { id: "input", type: "input" },
    { id: "sum", type: "fn", fnName: "add" },
    { id: "product", type: "fn", fnName: "multiply" },
    { id: "output", type: "output" },
  ],
  edges: [
    {
      id: "a-to-sum",
      source: "input",
      sourceHandle: 0,
      target: "sum",
      targetHandle: 0,
    },
    {
      id: "b-to-sum",
      source: "input",
      sourceHandle: 1,
      target: "sum",
      targetHandle: 1,
    },
    {
      id: "sum-to-product",
      source: "sum",
      sourceHandle: 0,
      target: "product",
      targetHandle: 0,
    },
    {
      id: "c-to-product",
      source: "input",
      sourceHandle: 2,
      target: "product",
      targetHandle: 1,
    },
    {
      id: "product-to-output",
      source: "product",
      sourceHandle: 0,
      target: "output",
      targetHandle: 0,
    },
  ],
} satisfies FlowSpec;

const compiled = compileFlow({ flow: formula, fnList: arithmeticFns });
const runFormula = compiled.define.implement(compiled.implement);

const inputClass =
  "w-24 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

export function FlowExample() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(2);
  const [c, setC] = useState(3);
  const result = useMemo(() => runFormula(a, b, c), [a, b, c]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        {[
          { label: "a", value: a, setValue: setA },
          { label: "b", value: b, setValue: setB },
          { label: "c", value: c, setValue: setC },
        ].map(({ label, value, setValue }) => (
          <label key={label} className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
            <input
              type="number"
              value={value}
              onChange={(event) => setValue(Number(event.currentTarget.value))}
              className={inputClass}
            />
          </label>
        ))}
      </div>
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
        ({a} + {b}) × {c} = <strong>{String(result)}</strong>
      </div>
    </div>
  );
}

export default FlowExample;
