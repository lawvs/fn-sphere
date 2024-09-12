import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";
// @ts-expect-error missing types
import liveCode from "astro-live-code";
import relativeLinks from "astro-relative-links";
import { defineConfig } from "astro/config";
// https://github.com/HiDeoo/starlight-typedoc
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Filter Sphere",
      social: {
        github: "https://github.com/lawvs/fn-sphere",
      },
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
        typeDocSidebarGroup,
        {
          label: "Changelog",
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
        }),
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
    tailwind({
      // Disable the default base styles:
      applyBaseStyles: false,
    }),
  ],
  vite: {
    ssr: {
      // Workaround for https://github.com/mui/material-ui/issues/42848
      noExternal: /@mui\/.*?/,
    },
  },
});
