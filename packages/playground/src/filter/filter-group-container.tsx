import type { FilterGroup } from "@fn-sphere/core";
import { useRootRule } from "@fn-sphere/filter";
import type { ReactNode } from "react";

type FlattenFilterGroupContainerProps = {
  filterGroup: FilterGroup;
  children?: ReactNode;
};

export const FlattenFilterGroupContainer = ({
  filterGroup,
  children,
}: FlattenFilterGroupContainerProps) => {
  const { getLocaleText } = useRootRule();

  const text =
    filterGroup.op === "or" ? getLocaleText("Or") : getLocaleText("And");

  return (
    <div
      className="filter-sphere-filter-group-container"
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        borderRadius: 4,
        padding: 4,
        gap: 4,
        background: "rgba(0, 0, 0, 0.05)",
      }}
    >
      <div
        style={{
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
