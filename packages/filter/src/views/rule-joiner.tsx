import type { FilterGroup, FilterRule } from "@fn-sphere/core";
import type { CommonProps } from "./types.js";

export type RuleJoinerProps = {
  parent: FilterGroup;
  joinBetween: [FilterRule, FilterRule];
} & CommonProps;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const RuleJoiner = (_props: RuleJoinerProps) => {
  return null;
};
RuleJoiner.displayName = "RuleJoiner";
