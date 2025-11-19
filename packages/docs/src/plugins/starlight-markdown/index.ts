import type { StarlightPlugin } from "@astrojs/starlight/types";
import type { AstroIntegration } from "astro";

/**
 * Ported from https://github.com/reynaldichernando/starlight-markdown
 *
 * Licensed under the MIT.
 */
export function starlightMarkdownIntegration(): AstroIntegration {
  return {
    name: "starlight-markdown",
    hooks: {
      "astro:config:setup": async ({ injectRoute }) => {
        injectRoute({
          pattern: "/index.md",
          entrypoint: new URL("./markdown.md.ts", import.meta.url),
        });
        injectRoute({
          pattern: "/[...path]/index.md",
          entrypoint: new URL("./markdown.md.ts", import.meta.url),
        });
      },
    },
  };
}

export default function starlightMarkdown(): StarlightPlugin {
  return {
    name: "starlight-markdown",
    hooks: {
      "config:setup"({ addIntegration }) {
        addIntegration(starlightMarkdownIntegration());
      },
    },
  };
}
