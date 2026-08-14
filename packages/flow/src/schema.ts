import { z } from "zod";

const flowInputNodeSpecSchema = z.object({
  id: z.string().min(1),
  type: z.literal("input"),
});

const flowFnNodeSpecSchema = z.object({
  id: z.string().min(1),
  type: z.literal("fn"),
  fnName: z.string().min(1),
});

const flowOutputNodeSpecSchema = z.object({
  id: z.string().min(1),
  type: z.literal("output"),
});

const flowNodeSpecSchema = z.discriminatedUnion("type", [
  flowInputNodeSpecSchema,
  flowFnNodeSpecSchema,
  flowOutputNodeSpecSchema,
]);

const flowEdgeSpecSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  sourceHandle: z.string().min(1),
  target: z.string().min(1),
  targetHandle: z.string().min(1),
});

export const flowSpecSchema = z.object({
  version: z.literal(1),
  nodes: z.array(flowNodeSpecSchema),
  edges: z.array(flowEdgeSpecSchema),
});

export type FlowInputNodeSpec = z.infer<typeof flowInputNodeSpecSchema>;
export type FlowFnNodeSpec = z.infer<typeof flowFnNodeSpecSchema>;
export type FlowOutputNodeSpec = z.infer<typeof flowOutputNodeSpecSchema>;
export type FlowNodeSpec = z.infer<typeof flowNodeSpecSchema>;
export type FlowEdgeSpec = z.infer<typeof flowEdgeSpecSchema>;
export type FlowSpec = z.infer<typeof flowSpecSchema>;
