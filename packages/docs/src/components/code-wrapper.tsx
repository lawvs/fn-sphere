import type { ReactNode } from "react";

export default function CodeWrapper({ children }: { children: ReactNode }) {
  return (
    <div
      // https://github.com/withastro/starlight/issues/1681
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
