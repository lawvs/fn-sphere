# @fn-sphere/flow

Compose `@fn-sphere/core` functions into an executable graph. A flow is a plain
object with input, function, and output nodes. The compiler infers the flow's
input and output schemas from the connected functions and returns another
`StandardFnSchema`, which can be reused in a larger flow.

```sh
pnpm add @fn-sphere/flow @fn-sphere/core zod
```

## Quick start

This flow computes `(a + b) * c` using the functions in `arithmeticFns`:

```ts
import { arithmeticFns } from "@fn-sphere/core";
import { compileFlow, type FlowSpec } from "@fn-sphere/flow";

const flow = {
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

const compiled = compileFlow({ flow, fnList: arithmeticFns });
const run = compiled.define.implement(compiled.implement);

run(1, 2, 3); // 9
```

`sourceHandle` and `targetHandle` are zero-based port numbers. An input node's
source handles become the compiled function's arguments in handle order. A
function node's target handles correspond to its Zod tuple parameters; its
single output uses source handle `0`. The output node receives the final value
at target handle `0`.

## Public API

The functions and flow types below are exported from `@fn-sphere/flow`. These
signatures use `StandardFnSchema` from `@fn-sphere/core` and Zod's core types
to show the compiled return shape. `CompiledFn` is a shorthand for this README.

```ts
import type { StandardFnSchema } from "@fn-sphere/core";
import type {
  FlowAnalysis,
  FlowSpec,
  FlowCompilation,
} from "@fn-sphere/flow";
import type { ZodType } from "zod";
import type { $ZodFunction, $ZodTuple, $ZodType } from "zod/v4/core";

type CompiledFn = StandardFnSchema<$ZodFunction<$ZodTuple, $ZodType>>;

declare function analyzeFlow(options: {
  flow: FlowSpec;
  fnList: readonly StandardFnSchema[];
}): FlowAnalysis;

declare function tryCompileFlow(options: {
  flow: FlowSpec;
  fnList: readonly StandardFnSchema[];
}): FlowCompilation;

declare function compileFlow(options: {
  flow: FlowSpec;
  fnList: readonly StandardFnSchema[];
}): CompiledFn;

declare const flowSpecSchema: ZodType<FlowSpec>;
```

`fnList` maps each function node's `fnName` to a `StandardFnSchema.name`.
`analyzeFlow` returns diagnostics without compiling. `tryCompileFlow` returns
diagnostics and, when valid, the compiled function. `compileFlow` returns the
compiled function directly and throws `Cannot compile invalid flow: ...` with
the distinct error codes when validation fails.

The graph types have these shapes:

```ts
type FlowSpec = {
  version: 1;
  name: string;
  nodes: FlowNodeSpec[];
  edges: FlowEdgeSpec[];
};

type FlowInputNodeSpec = { id: string; type: "input" };
type FlowFnNodeSpec = { id: string; type: "fn"; fnName: string };
type FlowOutputNodeSpec = { id: string; type: "output" };
type FlowNodeSpec = FlowInputNodeSpec | FlowFnNodeSpec | FlowOutputNodeSpec;

type FlowEdgeSpec = {
  id: string;
  source: string;
  sourceHandle: number;
  target: string;
  targetHandle: number;
};
```

`flowSpecSchema` validates this serialized shape: `name`, node IDs, edge IDs,
and `fnName` must be nonempty strings, and handles must be nonnegative integers.
It does not check whether a graph can execute; use `analyzeFlow` or
`tryCompileFlow` for that.

```ts
import { flowSpecSchema } from "@fn-sphere/flow";

const flow = flowSpecSchema.parse(JSON.parse(serialized));
```

Diagnostics and compilation results have these shapes:

```ts
type FlowDiagnosticSeverity = "error" | "warning";

type FlowDiagnosticCode =
  | "duplicate-node-id"
  | "duplicate-edge-id"
  | "duplicate-function-name"
  | "missing-input-node"
  | "multiple-input-nodes"
  | "missing-output-node"
  | "multiple-output-nodes"
  | "unsupported-function-input"
  | "unknown-function"
  | "unknown-source-node"
  | "invalid-source-handle"
  | "invalid-target-handle"
  | "multiple-input-consumers"
  | "multiple-input-edges"
  | "missing-input-edge"
  | "unresolved-input-schema"
  | "incompatible-edge"
  | "cycle"
  | "unreachable-node";

type FlowDiagnostic = {
  severity: FlowDiagnosticSeverity;
  code: FlowDiagnosticCode;
  message: string;
  nodeId?: string;
  edgeId?: string;
  handle?: number;
};

type FlowAnalysis = {
  valid: boolean;
  diagnostics: FlowDiagnostic[];
};

type FlowCompilation =
  | { valid: false; diagnostics: FlowDiagnostic[] }
  | { valid: true; diagnostics: FlowDiagnostic[]; compiled: CompiledFn };
```

`valid` is `false` when there is an error. An output-unreachable function node
produces an `unreachable-node` warning and is excluded from execution; warnings
do not prevent compilation.

```ts
import { tryCompileFlow } from "@fn-sphere/flow";

const result = tryCompileFlow({ flow, fnList: arithmeticFns });
if (!result.valid) {
  console.error(result.diagnostics);
} else {
  const run = result.compiled.define.implement(result.compiled.implement);
  console.log(run(1, 2, 3));
}
```

## Graph and execution rules

- A flow has exactly one input node and one output node. Node IDs and edge IDs
  must be unique.
- Output-reachable function nodes must refer to functions in `fnList` with
  unique names and fixed Zod tuple inputs. Each function parameter and the
  output node must have exactly one incoming edge.
- Active input handles must start at `0`, have no gaps, and each have one
  consumer. A function result may feed multiple nodes.
- The output-reachable function nodes must be acyclic. Function-to-function
  edges are checked for schema compatibility with `zod-compare`.
- Flow input schemas are inferred from their target parameters. The input node
  represents arguments; it does not execute a conversion. Flow does not insert
  conversions or rewrite registered function schemas. A direct input-to-output
  edge has no target schema to infer and cannot be compiled. Edge matching for
  schemas with Zod transforms is undefined.

At runtime, the compiler evaluates the active function nodes in dependency
order. Each registered function uses its own `define.implement(implement)`
wrapper unless that function has `skipValidate: true`. To validate the compiled
flow's arguments and result, call its `define.implement(compiled.implement)` as
shown above. Reuse the compiled function while only values change; compile
again when the graph changes. A compiled flow can also be included in another
flow's `fnList` under its `name`.
