import type { LooseFilterRule } from "@fn-sphere/core";
import type { ComponentType, InputHTMLAttributes, RefAttributes } from "react";
import type { ZodTuple, z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// type RefCallBack = (instance: any) => void;

export type DataInputViewProps = {
  rule: LooseFilterRule;
  inputSchema: ZodTuple;
  onChange: (rule: LooseFilterRule) => void;
} & RefAttributes<HTMLInputElement>;

export type DataInputViewSpec = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  match: z.ZodTuple<any> | ((schema: z.ZodTuple<any>) => boolean);
  view: ComponentType<DataInputViewProps>;
};

export type ViewSpec = {
  input: ComponentType<
    InputHTMLAttributes<HTMLInputElement> & RefAttributes<HTMLInputElement>
  >;
  dataInputPlaceholder: ComponentType<RefAttributes<HTMLInputElement>>;
  dataInputViews: DataInputViewSpec[];
};
