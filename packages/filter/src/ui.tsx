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
  const text = filterGroup.op === "or" ? "Or" : "And";
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
        {text}
      </div>
      <div
        style={{
          borderRadius: 4,
          padding: 4,
          background: "rgba(0, 0, 0, 0.05)",
        }}
      >
        {children}
      </div>
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
