import type { FilterGroup } from "@fn-sphere/core";
import type { ReactNode } from "react";

export type FilterGroupContainerProps = {
  filterGroup: FilterGroup;
  isRoot: boolean;
  children?: ReactNode;
};

export const FilterGroupContainer = ({
  filterGroup,
  children,
}: FilterGroupContainerProps) => {
  // const {
  //   ruleState: { isRoot },
  // } = useFilterGroup(filterGroup);
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
