import type { SingleFilter } from "@fn-sphere/core";
import { useCallback, type ReactNode } from "react";
import { useFilterRule } from "../hooks/use-filter-rule.js";
import { useView } from "../theme/hooks.js";
import type { CommonProps } from "./types.js";

export type SingleFilterContainerProps = {
  rule: SingleFilter;
  children?: ReactNode;
} & CommonProps;

export const SingleFilterContainer = ({
  rule,
  children,
  ...props
}: SingleFilterContainerProps) => {
  const { ErrorBoundary } = useView("components");
  const { removeRule } = useFilterRule(rule);

  const handleDelete = useCallback(() => {
    removeRule(true);
  }, [removeRule]);

  return (
    <ErrorBoundary onDelete={handleDelete}>
      <div
        className="filter-sphere-single-filter-container"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
        {...props}
      >
        {children}
      </div>
    </ErrorBoundary>
  );
};
SingleFilterContainer.displayName = "SingleFilterContainer";
