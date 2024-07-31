import type { FilterGroup, FilterRule } from "@fn-sphere/core";

export type RuleJoinerProps = {
  parent: FilterGroup;
  joinBetween: [FilterRule, FilterRule];
};

export const RuleJoiner = ({ parent }: RuleJoinerProps) => {
  const operator = parent.op;
  return (
    <div
      style={{
        margin: 8,
      }}
    >
      {operator === "or" ? "Or" : "And"}
    </div>
  );
};
