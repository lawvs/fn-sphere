import type { FilterGroup } from "@fn-sphere/core";
import { useCallback, type ReactNode } from "react";
import { useFilterGroup } from "../hooks/use-filter-group.js";
import { useRootRule } from "../hooks/use-root-rule.js";
import { useView } from "../theme/hooks.js";

export type FilterGroupContainerProps = {
  rule: FilterGroup;
  children?: ReactNode;
};

export const FilterGroupContainer = ({
  rule,
  children,
}: FilterGroupContainerProps) => {
  const { getLocaleText } = useRootRule();
  const {
    ruleState: { isRoot, depth },
    toggleGroupOp,
    appendChildRule,
    appendChildGroup,
    removeGroup,
  } = useFilterGroup(rule);
  const { Button } = useView("components");

  const text =
    rule.op === "or"
      ? getLocaleText("operatorOr")
      : getLocaleText("operatorAnd");

  const handleToggleGroupOp = useCallback(() => {
    toggleGroupOp();
  }, [toggleGroupOp]);

  const handleAddCondition = useCallback(() => {
    appendChildRule();
  }, [appendChildRule]);

  const handleAddGroup = useCallback(() => {
    appendChildGroup();
  }, [appendChildGroup]);

  const handleDeleteGroup = useCallback(() => {
    removeGroup();
  }, [removeGroup]);

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
        <Button onClick={handleAddCondition}>{getLocaleText("addRule")}</Button>
        {depth < 3 && (
          <Button onClick={handleAddGroup}>{getLocaleText("addGroup")}</Button>
        )}
        {!isRoot && (
          <Button onClick={handleDeleteGroup}>
            {getLocaleText("deleteGroup")}
          </Button>
        )}
      </div>
    </div>
  );
};
