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
      className="filter-group-container"
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        padding: 4,
        background: "rgba(0, 0, 0, 0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          marginRight: 12,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
      {children}
    </div>
  );
};
