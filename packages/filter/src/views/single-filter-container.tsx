import type { SingleFilter } from "@fn-sphere/core";
import type { ReactNode } from "react";

export type SingleFilterContainerProps = {
  rule: SingleFilter;
  children?: ReactNode;
};

export const SingleFilterContainer = ({
  children,
}: SingleFilterContainerProps) => {
  return (
    <div
      className="single-filter-container"
      style={{
        display: "flex",
      }}
    >
      {children}
    </div>
  );
};
