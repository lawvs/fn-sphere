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
  edges: [...edges],
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
        severity: "error",
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

  test("reports one input handle connected to multiple nodes", () => {
    const flow = createFormula([
      ...validEdges.filter((edge) => edge.id !== "c-to-product"),
      {
        id: "a-to-product",
        source: "input",
        sourceHandle: 0,
        target: "product",
        targetHandle: 1,
      },
    ]);

    const analysis = analyzeFlow({
      flow,
      fnList: arithmeticFns,
    });

    expect(analysis.valid).toBe(false);
    expect(analysis.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "multiple-input-consumers",
        nodeId: "input",
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

  test("warns about an unreachable invalid function without rejecting the flow", () => {
    const flow = createFormula();
    flow.nodes.push({ id: "draft", type: "fn", fnName: "missing" });

    const analysis = analyzeFlow({ flow, fnList: arithmeticFns });

    expect(analysis.valid).toBe(true);
    expect(analysis.diagnostics).toEqual([
      expect.objectContaining({
        severity: "warning",
        code: "unreachable-node",
        nodeId: "draft",
      }),
    ]);
  });

  test("ignores a dead consumer when validating flow input fan-out", () => {
    const flow = createFormula();
    flow.nodes.push({ id: "draft", type: "fn", fnName: "add" });
    flow.edges.push({
      id: "a-to-draft",
      source: "input",
      sourceHandle: 0,
      target: "draft",
      targetHandle: 0,
    });

    const analysis = analyzeFlow({ flow, fnList: arithmeticFns });

    expect(analysis.valid).toBe(true);
    expect(analysis.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "warning",
        code: "unreachable-node",
        nodeId: "draft",
      }),
    );
    expect(analysis.diagnostics).not.toContainEqual(
      expect.objectContaining({ code: "multiple-input-consumers" }),
    );
  });

  test("ignores a dead cycle", () => {
    const flow = createFormula();
    flow.nodes.push(
      { id: "dead-a", type: "fn", fnName: "add" },
      { id: "dead-b", type: "fn", fnName: "add" },
    );
    flow.edges.push(
      {
        id: "dead-a-b",
        source: "dead-a",
        sourceHandle: 0,
        target: "dead-b",
        targetHandle: 0,
      },
      {
        id: "dead-b-a",
        source: "dead-b",
        sourceHandle: 0,
        target: "dead-a",
        targetHandle: 0,
      },
    );

    const analysis = analyzeFlow({ flow, fnList: arithmeticFns });

    expect(analysis.valid).toBe(true);
    expect(analysis.diagnostics).not.toContainEqual(
      expect.objectContaining({ code: "cycle" }),
    );
    expect(analysis.diagnostics).toHaveLength(2);
  });

  test("rejects a cycle that contributes to the output", () => {
    const flow = createFormula([
      {
        id: "a-to-sum",
        source: "input",
        sourceHandle: 0,
        target: "sum",
        targetHandle: 1,
      },
      {
        id: "product-to-sum",
        source: "product",
        sourceHandle: 0,
        target: "sum",
        targetHandle: 0,
      },
      {
        id: "sum-to-product",
        source: "sum",
        sourceHandle: 0,
        target: "product",
        targetHandle: 0,
      },
      {
        id: "b-to-product",
        source: "input",
        sourceHandle: 1,
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
    ]);

    const analysis = analyzeFlow({ flow, fnList: arithmeticFns });

    expect(analysis.valid).toBe(false);
    expect(analysis.diagnostics).toContainEqual(
      expect.objectContaining({ severity: "error", code: "cycle" }),
    );
    expect(analysis.diagnostics).not.toContainEqual(
      expect.objectContaining({ code: "unreachable-node" }),
    );
  });

  test("does not report reachability when there is no unique output", () => {
    const flow = createFormula();
    flow.nodes = flow.nodes.filter((node) => node.type !== "output");

    const analysis = analyzeFlow({ flow, fnList: arithmeticFns });

    expect(analysis.valid).toBe(false);
    expect(analysis.diagnostics).toContainEqual(
      expect.objectContaining({ code: "missing-output-node" }),
    );
    expect(analysis.diagnostics).not.toContainEqual(
      expect.objectContaining({ code: "unreachable-node" }),
    );
  });

  test("ignores an edge whose target cannot contribute to the output", () => {
    const flow = createFormula();
    flow.edges.push({
      id: "product-to-nowhere",
      source: "product",
      sourceHandle: 0,
      target: "missing",
      targetHandle: 0,
    });

    expect(analyzeFlow({ flow, fnList: arithmeticFns })).toEqual({
      valid: true,
      diagnostics: [],
    });
  });

  test("ignores duplicate function names unused by the executable slice", () => {
    const subtract = arithmeticFns.find((fn) => fn.name === "subtract")!;

    expect(
      analyzeFlow({
        flow: createFormula(),
        fnList: [...arithmeticFns, subtract],
      }),
    ).toEqual({ valid: true, diagnostics: [] });
  });

  test("rejects a duplicate function name used by the executable slice", () => {
    const add = arithmeticFns.find((fn) => fn.name === "add")!;
    const analysis = analyzeFlow({
      flow: createFormula(),
      fnList: [...arithmeticFns, add],
    });

    expect(analysis.valid).toBe(false);
    expect(analysis.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "error",
        code: "duplicate-function-name",
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

  test("compiles and runs when unreachable nodes are invalid", () => {
    const flow = createFormula();
    flow.nodes.push({ id: "draft", type: "fn", fnName: "missing" });
    flow.edges.push({
      id: "unused-input-to-draft",
      source: "input",
      sourceHandle: 3,
      target: "draft",
      targetHandle: 0,
    });

    const compiled = compileFlow({ flow, fnList: arithmeticFns });
    const run = compiled.define.implement(compiled.implement);

    expect(run(1, 2, 3)).toBe(9);
    expect(compiled.define._zod.def.input._zod.def.items).toHaveLength(3);
  });

  test("excludes warning codes from invalid-flow errors", () => {
    const edges = validEdges.filter((edge) => edge.id !== "b-to-sum");
    const flow = createFormula(edges);
    flow.nodes.push({ id: "draft", type: "fn", fnName: "missing" });

    expect(() => compileFlow({ flow, fnList: arithmeticFns })).toThrowError(
      /^(?!.*unreachable-node).*missing-input-edge/,
    );
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
