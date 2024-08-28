import type { FilterGroup } from "@fn-sphere/core";
import { useCallback, type ReactNode } from "react";
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
  const { toggleGroupOp, appendChildRule, appendChildGroup } =
    useFilterGroup(filterGroup);
  const { Button } = useView("components");

  const text =
    filterGroup.op === "or" ? getLocaleText("Or") : getLocaleText("And");

  const handleToggleGroupOp = useCallback(() => {
    toggleGroupOp();
  }, [toggleGroupOp]);

  const handleAddCondition = useCallback(() => {
    appendChildRule();
  }, [appendChildRule]);

  const handleAddGroup = useCallback(() => {
    appendChildGroup();
  }, [appendChildGroup]);

  return (
    <div
      className="filter-sphere-filter-group-container"
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        borderRadius: 4,
        padding: 8,
        gap: 8,
        background: "rgba(0, 0, 0, 0.05)",
      }}
    >
      <Button onClick={handleToggleGroupOp}>{text}</Button>
      {children}
      <div
        className="filter-sphere-filter-group-container-actions"
        style={{
          display: "flex",
          gap: 8,
        }}
      >
        <Button onClick={handleAddCondition}>
          {getLocaleText("Add condition")}
        </Button>
        <Button onClick={handleAddGroup}>{getLocaleText("Add group")}</Button>
      </div>
    </div>
  );
};
