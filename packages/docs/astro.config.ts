import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import liveCode from "astro-live-code";
import relativeLinks from "astro-relative-links";
import { defineConfig } from "astro/config";
import rehypeExternalLinks from "rehype-external-links";
// https://github.com/HiDeoo/starlight-typedoc
import tailwindcss from "@tailwindcss/vite";
import starlightTypeDoc from "starlight-typedoc";
// https://github.com/HiDeoo/starlight-links-validator
import starlightLinksValidator from "starlight-links-validator";

// https://astro.build/config
export default defineConfig({
  markdown: {
    rehypePlugins: [
      // https://www.npmjs.com/package/rehype-external-links
      [
        rehypeExternalLinks,
        { target: "_blank", rel: ["noopener", "noreferrer"] },
      ],
    ],
  },
  integrations: [
    starlight({
      title: "Filter Sphere",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/lawvs/fn-sphere",
        },
      ],
      sidebar: [
        {
          label: "Guides",
          autogenerate: {
            directory: "guides",
          },
        },
        {
          label: "Customization",
          autogenerate: {
            directory: "customization",
          },
        },
        {
          label: "Reference",
          autogenerate: {
            directory: "reference",
          },
        },
        // Prefer to show the API overviews in the sidebar, so we don't need this.
        // typeDocSidebarGroup,
        {
          label: "API",
          collapsed: true,
          autogenerate: {
            directory: "api",
          },
        },
        {
          label: "Changelog",
          collapsed: true,
          items: [
            {
              label: "@fn-sphere/filter",
              link: "/changelog",
            },
          ],
        },
      ],
      customCss: [
        // Relative path to your custom CSS file
        "~/styles/custom.css",
        "~/styles/tailwind.css",
      ],
      plugins: [
        // Generate the documentation.
        starlightTypeDoc({
          entryPoints: ["../filter/src/index.ts"],
          tsconfig: "../filter/tsconfig.json",
          typeDoc: {
            entryFileName: "index.md",
          },
        }),
        starlightLinksValidator(),
      ],
    }),
    react(),
    liveCode({
      wrapper: "~/components/code-wrapper.tsx",
      defaultProps: {
        "client:load": true,
      },
    }), // Workaround for https://github.com/withastro/astro/issues/4229
    relativeLinks(),
  ],
  vite: {
    ssr: {
      // Workaround for https://github.com/mui/material-ui/issues/42848
      noExternal: /@mui\/.*?/,
    },
    plugins: [tailwindcss()],
  },
});
