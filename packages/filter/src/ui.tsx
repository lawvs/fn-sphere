import type { LooseFilterGroup, LooseFilterRule } from "@fn-sphere/core";
import type { ReactNode } from "react";

export const FilterGroupContainer = ({
  filterGroup,
  children,
}: {
  isRoot: boolean;
  filterGroup: LooseFilterGroup;
  children: ReactNode;
}) => {
  // if (isRoot) {
  //   return children;
  // }
  return (
    <div
      className="filter-builder-group-container"
      style={{
        display: "flex",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        {filterGroup.op === "or" ? "Or" : "And"}
      </div>
      <div>{children}</div>
    </div>
  );
};

export const FilterRuleJoiner = ({
  operator,
}: {
  operator: LooseFilterGroup["op"];
  joinBetween: [
    LooseFilterRule | LooseFilterGroup,
    LooseFilterRule | LooseFilterGroup,
  ];
}) => {
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
