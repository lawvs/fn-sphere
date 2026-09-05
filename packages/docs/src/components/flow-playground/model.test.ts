import { describe, expect, test } from "vitest";
import {
  createPlaygroundEdges,
  createPlaygroundNodes,
  preparePlayground,
  runPlayground,
} from "./model";

describe("flow playground execution", () => {
  test("reuses preparation across input changes and ignores unused inputs", () => {
    const nodes = createPlaygroundNodes();
    nodes.push({
      id: "draft",
      type: "flow",
      position: { x: 0, y: 0 },
      data: { flowType: "fn", fnName: "missing" },
    });
    const prepared = preparePlayground(
      "formula",
      nodes,
      createPlaygroundEdges(),
    );

    expect(prepared.status).toBe("ready");
    expect(prepared.diagnostics).toEqual([
      expect.objectContaining({
        severity: "warning",
        code: "unreachable-node",
      }),
    ]);
    expect(runPlayground(prepared, [1, 2, 3])).toMatchObject({
      status: "success",
      value: 9,
      diagnostics: prepared.diagnostics,
    });
    expect(runPlayground(prepared, [3, 4, 5, 999])).toMatchObject({
      status: "success",
      value: 35,
    });
  });

  test("keeps invalid graph diagnostics when input values change", () => {
    const prepared = preparePlayground(
      "formula",
      createPlaygroundNodes(),
      createPlaygroundEdges().filter((edge) => edge.id !== "b-to-sum"),
    );

    expect(prepared.status).toBe("invalid");
    expect(runPlayground(prepared, [1, 2, 3])).toMatchObject({
      status: "invalid",
      diagnostics: expect.arrayContaining([
        expect.objectContaining({ code: "missing-input-edge" }),
      ]),
    });
  });

  test("reports malformed canvas handles as preparation errors", () => {
    const edges = createPlaygroundEdges();
    edges[0]!.sourceHandle = null;

    expect(
      preparePlayground("formula", createPlaygroundNodes(), edges),
    ).toMatchObject({
      status: "invalid",
      error: "Edge a-to-sum requires a numeric handle ID.",
    });
  });

  test("recovers from a runtime error using the same prepared function", () => {
    const nodes = createPlaygroundNodes();
    const product = nodes.find((node) => node.id === "product")!;
    product.data = { flowType: "fn", fnName: "divide" };
    const prepared = preparePlayground(
      "quotient",
      nodes,
      createPlaygroundEdges(),
    );

    expect(prepared.status).toBe("ready");
    expect(runPlayground(prepared, [1, 2, 0])).toMatchObject({
      status: "error",
      error: "Division by zero",
    });
    expect(runPlayground(prepared, [1, 2, 3])).toMatchObject({
      status: "success",
      value: 1,
    });
  });
});
