import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
// @ts-expect-error missing types
import liveCode from "astro-live-code";
import { defineConfig } from "astro/config";

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
      ],
    }),
    react(),
    liveCode({
      wrapper: "~/components/code-wrapper.tsx",
      defaultProps: {
        "client:load": true,
      },
    }),
  ],
  vite: {
    ssr: {
      // Workaround for https://github.com/mui/material-ui/issues/42848
      noExternal: /@mui\/.*?/,
    },
  },
});
