import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { cloneElement, useEffect, useState } from "react";
import { z } from "zod";
import CodeWrapper from "./code-wrapper";

function useThemeMode(): "light" | "dark" {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const updateMode = () => {
      if (typeof window !== "undefined") {
        setMode(
          (document.documentElement.dataset.theme as "light" | "dark") ||
            "light",
        );
      }
    };

    updateMode();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          updateMode();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);
  return mode;
}

// Define your data schema
const schema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.date(),
  checked: z.boolean(),
  status: z.union([
    z.literal("pending"),
    z.literal("completed"),
    z.literal("cancelled"),
  ]),
});

export default function MuiThemeWrapper({ children }: { children: ReactNode }) {
  const mode = useThemeMode();
  const muiTheme = createTheme({
    palette: {
      mode,
    },
  });

  return (
    <CodeWrapper>
      <ThemeProvider theme={muiTheme}>
        <ScopedCssBaseline />
        {cloneElement(children as any, { schema })}
      </ThemeProvider>
    </CodeWrapper>
  );
}
