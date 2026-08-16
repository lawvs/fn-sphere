import { arithmeticFns } from "@fn-sphere/core";
import { compileFlow, type FlowSpec } from "@fn-sphere/flow";
import { useMemo, useState } from "react";

const formulaSpec = {
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

const formula = compileFlow({ flow: formulaSpec, fnList: arithmeticFns });

const outerSpec = {
  version: 1,
  name: "formulaPlus",
  nodes: [
    { id: "input", type: "input" },
    { id: "formula", type: "fn", fnName: "formula" },
    { id: "add", type: "fn", fnName: "add" },
    { id: "output", type: "output" },
  ],
  edges: [
    {
      id: "a-to-formula",
      source: "input",
      sourceHandle: 0,
      target: "formula",
      targetHandle: 0,
    },
    {
      id: "b-to-formula",
      source: "input",
      sourceHandle: 1,
      target: "formula",
      targetHandle: 1,
    },
    {
      id: "c-to-formula",
      source: "input",
      sourceHandle: 2,
      target: "formula",
      targetHandle: 2,
    },
    {
      id: "formula-to-add",
      source: "formula",
      sourceHandle: 0,
      target: "add",
      targetHandle: 0,
    },
    {
      id: "d-to-add",
      source: "input",
      sourceHandle: 3,
      target: "add",
      targetHandle: 1,
    },
    {
      id: "add-to-output",
      source: "add",
      sourceHandle: 0,
      target: "output",
      targetHandle: 0,
    },
  ],
} satisfies FlowSpec;

const outer = compileFlow({
  flow: outerSpec,
  fnList: [...arithmeticFns, formula],
});
const runOuter = outer.define.implement(outer.implement);

export function FlowCompositionExample() {
  const [values, setValues] = useState([1, 2, 3, 4]);
  const result = useMemo(() => runOuter(...values), [values]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {values.map((value, index) => (
          <label key={index} className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {String.fromCharCode(97 + index)}
            </span>
            <input
              type="number"
              value={value}
              onChange={(event) => {
                const next = [...values];
                next[index] = Number(event.currentTarget.value);
                setValues(next);
              }}
              className="w-24 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
        ))}
      </div>
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
        (({values[0]} + {values[1]}) × {values[2]}) + {values[3]} ={" "}
        <strong>{String(result)}</strong>
      </div>
    </div>
  );
}

export default FlowCompositionExample;
