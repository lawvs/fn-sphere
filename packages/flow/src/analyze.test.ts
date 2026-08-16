import { arithmeticFns } from "@fn-sphere/core";
import { describe, expect, test } from "vitest";
import { z } from "zod";
import { analyzeFlow, compileFlow, type FlowEdgeSpec } from "./index.js";

const validEdges: FlowEdgeSpec[] = [
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
];

const createFormula = (edges: FlowEdgeSpec[] = validEdges) => ({
  version: 1 as const,
  name: "formula",
  nodes: [
    { id: "input", type: "input" as const },
    { id: "sum", type: "fn" as const, fnName: "add" },
    { id: "product", type: "fn" as const, fnName: "multiply" },
    { id: "output", type: "output" as const },
  ],
  edges,
});

describe("analyzeFlow", () => {
  test("accepts a valid flow", () => {
    expect(
      analyzeFlow({ flow: createFormula(), fnList: arithmeticFns }),
    ).toEqual({
      valid: true,
      diagnostics: [],
    });
  });

  test("reports a missing function input edge", () => {
    const edges = validEdges.filter((edge) => edge.id !== "b-to-sum");

    const analysis = analyzeFlow({
      flow: createFormula(edges),
      fnList: arithmeticFns,
    });

    expect(analysis.valid).toBe(false);
    expect(analysis.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "missing-input-edge",
        nodeId: "sum",
        handle: 1,
      }),
    );
  });

  test("reports multiple edges targeting the same input", () => {
    const edges = [
      ...validEdges,
      {
        id: "c-also-to-sum",
        source: "input",
        sourceHandle: 2,
        target: "sum",
        targetHandle: 1,
      },
    ];

    const analysis = analyzeFlow({
      flow: createFormula(edges),
      fnList: arithmeticFns,
    });

    expect(analysis.valid).toBe(false);
    expect(analysis.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "multiple-input-edges",
        nodeId: "sum",
        handle: 1,
      }),
    );
  });

  test("reports different schemas inferred for one input handle", () => {
    const stringIdentity = {
      name: "stringIdentity",
      define: z.function({
        input: [z.string()],
        output: z.string(),
      }),
      implement: (value: string) => value,
    };
    const flow = createFormula([
      ...validEdges,
      {
        id: "a-to-string-identity",
        source: "input",
        sourceHandle: 0,
        target: "stringIdentity",
        targetHandle: 0,
      },
    ]);
    flow.nodes.push({
      id: "stringIdentity",
      type: "fn",
      fnName: "stringIdentity",
    });

    const analysis = analyzeFlow({
      flow,
      fnList: [...arithmeticFns, stringIdentity],
    });

    expect(analysis.valid).toBe(false);
    expect(analysis.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "conflicting-input-schema",
        edgeId: "a-to-string-identity",
        handle: 0,
      }),
    );
  });

  test("reports an input-to-output edge without an inferred schema", () => {
    const analysis = analyzeFlow({
      flow: {
        version: 1,
        name: "passthrough",
        nodes: [
          { id: "input", type: "input" },
          { id: "output", type: "output" },
        ],
        edges: [
          {
            id: "input-to-output",
            source: "input",
            sourceHandle: 0,
            target: "output",
            targetHandle: 0,
          },
        ],
      },
      fnList: arithmeticFns,
    });

    expect(analysis.valid).toBe(false);
    expect(analysis.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "unresolved-input-schema",
        handle: 0,
      }),
    );
  });

  test("reports functions without fixed tuple inputs", () => {
    const variadicAdd = {
      ...arithmeticFns[0]!,
      name: "add",
      define: z.function({
        input: z.array(z.number()),
        output: z.number(),
      }),
      implement: (...values: number[]) =>
        values.reduce((total, value) => total + value, 0),
    };

    const analysis = analyzeFlow({
      flow: createFormula(),
      fnList: [variadicAdd, ...arithmeticFns.slice(1)],
    });

    expect(analysis.valid).toBe(false);
    expect(analysis.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "unsupported-function-input",
        nodeId: "sum",
      }),
    );
  });
});

describe("compileFlow", () => {
  test("executes the compiled flow", () => {
    const compiled = compileFlow({
      flow: createFormula(),
      fnList: arithmeticFns,
    });
    const run = compiled.define.implement(compiled.implement);

    expect(run(1, 2, 3)).toBe(9);
  });

  test("rejects an invalid flow", () => {
    const edges = validEdges.filter((edge) => edge.id !== "b-to-sum");

    expect(() =>
      compileFlow({
        flow: createFormula(edges),
        fnList: arithmeticFns,
      }),
    ).toThrowError(/missing-input-edge/);
  });

  test("allows a compiled flow to be used as a function node", () => {
    const formula = compileFlow({
      flow: createFormula(),
      fnList: arithmeticFns,
    });
    const nestedFlow = {
      version: 1 as const,
      name: "nestedFormula",
      nodes: [
        { id: "input", type: "input" as const },
        { id: "formula", type: "fn" as const, fnName: "formula" },
        { id: "add", type: "fn" as const, fnName: "add" },
        { id: "output", type: "output" as const },
      ],
      edges: [
        {
          id: "input-0-to-formula-0",
          source: "input",
          sourceHandle: 0,
          target: "formula",
          targetHandle: 0,
        },
        {
          id: "input-1-to-formula-1",
          source: "input",
          sourceHandle: 1,
          target: "formula",
          targetHandle: 1,
        },
        {
          id: "input-2-to-formula-2",
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
          id: "input-3-to-add",
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
    };
    const compiled = compileFlow({
      flow: nestedFlow,
      fnList: [...arithmeticFns, formula],
    });
    const run = compiled.define.implement(compiled.implement);

    expect(run(1, 2, 3, 4)).toBe(13);
  });
});
