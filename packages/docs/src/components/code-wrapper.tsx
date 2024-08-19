import type { ReactNode } from "react";

export default function CodeWrapper({ children }: { children: ReactNode }) {
  return (
    <div
      className="not-content"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "16px",
      }}
    >
      {children}
    </div>
  );
}
