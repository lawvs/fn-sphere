import type { FilterGroup, FilterRule } from "@fn-sphere/core";

export type RuleJoinerProps = {
  parent: FilterGroup;
  joinBetween: [FilterRule, FilterRule];
};

export const RuleJoiner = ({ parent }: RuleJoinerProps) => {
  const operator = parent.op;
  return <div className={`filter-sphere-rule-joiner-${operator}`}></div>;
};
RuleJoiner.displayName = "RuleJoiner";
