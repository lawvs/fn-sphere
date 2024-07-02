import type { LooseFilterRule } from "@fn-sphere/core";
import type { ComponentType } from "react";
import type { ZodTuple, z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RefCallBack = (instance: any) => void;

type ViewProps = {
  /**
   * React element ref
   */
  ref: RefCallBack;
  rule: LooseFilterRule;
  inputSchema: ZodTuple;
  onChange: (rule: LooseFilterRule) => void;
};

export type ViewSpec =
  | {
      name: string;
      match: z.ZodTypeAny | ((schema: z.ZodTypeAny) => boolean);
      view: ComponentType<ViewProps>;
    }
  | {
      // Use when user does not select any field
      name: "placeholder";
      match: null;
      view: ComponentType<{ ref: RefCallBack }>;
    };
