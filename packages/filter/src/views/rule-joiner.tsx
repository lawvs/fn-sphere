import type { FilterGroup, FilterRule } from "@fn-sphere/core";

export type RuleJoinerProps = {
  parent: FilterGroup;
  joinBetween: [FilterRule, FilterRule];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const RuleJoiner = (_props: RuleJoinerProps) => {
  return null;
};
RuleJoiner.displayName = "RuleJoiner";
