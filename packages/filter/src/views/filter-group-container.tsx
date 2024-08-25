import type { FilterGroup } from "@fn-sphere/core";
import type { ReactNode } from "react";
import { useFilterGroup } from "../hooks/use-filter-group.js";
import { useRootRule } from "../hooks/use-root-rule.js";
import { useView } from "../theme/hooks.js";

export type FilterGroupContainerProps = {
  filterGroup: FilterGroup;
  children?: ReactNode;
};

export const FilterGroupContainer = ({
  filterGroup,
  children,
}: FilterGroupContainerProps) => {
  const { getLocaleText } = useRootRule();
  const { toggleGroupOp } = useFilterGroup(filterGroup);
  const { Button } = useView("components");

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
      <Button
        onClick={() => {
          toggleGroupOp();
        }}
        style={{
          marginRight: 12,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </Button>
      {children}
    </div>
  );
};
