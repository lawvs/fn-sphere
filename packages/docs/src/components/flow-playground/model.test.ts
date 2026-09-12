import { describe, expect, test } from "vitest";
import {
  createFunctionNode,
  createPlaygroundEdges,
  createPlaygroundNodes,
  preparePlayground,
  runPlayground,
} from "./model";

describe("flow playground execution", () => {
  test("resolves input views from connections before the graph is executable", () => {
    const nodes = [...createPlaygroundNodes(), createFunctionNode("not", 1)];
    const edge = { ...createPlaygroundEdges()[0]!, target: "not-1" };
    const prepare = () => preparePlayground("draft", nodes, [edge]);

    expect(prepare().status).toBe("invalid");
    expect(
      prepare().inputSchemas.map((schema) => schema?._zod.def.type),
    ).toEqual(["boolean", undefined, undefined]);
    edge.target = "sum";
    expect(prepare().inputSchemas[0]?._zod.def.type).toBe("number");
    expect(preparePlayground("draft", nodes, []).inputSchemas).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
  });

  test("uses the compiled parameter type when a dead consumer has a different type", () => {
    const nodes = [...createPlaygroundNodes(), createFunctionNode("not", 1)];
    const edges = createPlaygroundEdges();
    edges.unshift({ ...edges[0]!, id: "dead-consumer", target: "not-1" });
    const prepared = preparePlayground("formula", nodes, edges);

    expect(prepared.status).toBe("ready");
    expect(prepared.inputSchemas[0]?._zod.def.type).toBe("number");
    expect(runPlayground(prepared, [1, 2, 3])).toMatchObject({
      status: "success",
      value: 9,
    });
    expect(runPlayground(prepared, ["1", 2, 3]).status).toBe("error");
    expect(runPlayground(prepared, [undefined, 2, 3]).status).toBe("error");
  });

  test("runs boolean input values while still rejecting incompatible function edges", () => {
    const nodes = createPlaygroundNodes();
    nodes.find((node) => node.id === "product")!.data = {
      flowType: "fn",
      fnName: "not",
    };
    const edges = createPlaygroundEdges();
    const prepared = preparePlayground("negate", nodes, [
      { ...edges[0]!, target: "product" },
      edges.at(-1)!,
    ]);
    expect(runPlayground(prepared, [false])).toMatchObject({
      status: "success",
      value: true,
    });
    expect(runPlayground(prepared, [true])).toMatchObject({
      status: "success",
      value: false,
    });

    const invalid = preparePlayground(
      "invalid",
      nodes,
      edges.filter((edge) => edge.id !== "c-to-product"),
    );
    expect(invalid.status).toBe("invalid");
    expect(invalid.diagnostics).toContainEqual(
      expect.objectContaining({ code: "incompatible-edge" }),
    );
  });

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
