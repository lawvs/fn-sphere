import type { SingleFilter } from "@fn-sphere/core";
import type { ReactNode } from "react";
import type { CommonProps } from "./types.js";

export type SingleFilterContainerProps = {
  rule: SingleFilter;
  children?: ReactNode;
} & CommonProps;

export const SingleFilterContainer = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rule: _rule,
  children,
  ...props
}: SingleFilterContainerProps) => {
  return (
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
  );
};
SingleFilterContainer.displayName = "SingleFilterContainer";
