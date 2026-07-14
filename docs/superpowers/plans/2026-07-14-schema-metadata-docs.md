# Schema Metadata Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move schema metadata documentation into a dedicated Customization page and replace the MUI field-icon recipe with a small native-select example.

**Architecture:** A dedicated MDX guide owns the metadata concept, typed Zod registration, consumer data flow, live example, and caveats. The React example overrides only `templates.FieldSelect`, uses Filter Sphere's preset native Select, and maps semantic metadata tokens to glyph-prefixed string labels.

**Tech Stack:** Astro Starlight, MDX, React 19, TypeScript, Filter Sphere, Zod 4, native HTML select, Tailwind utility classes.

## Global Constraints

- The live schema metadata example must not import MUI or `@fn-sphere/theme-mui-material`.
- The page title and primary explanation must describe schema metadata generally; field icons remain a subordinate example.
- Metadata values are application-owned semantic tokens, not JSX nodes or UI-library components.
- The custom `FieldSelect` must preserve `tryRetainArgs`, `tryRetainFilter`, and `autoSelectFirstFilter` behavior.
- A field without icon metadata must fall back to its unchanged label.
- Existing unrelated MUI documentation examples and dependencies remain unchanged.

---

### Task 1: Establish the documentation contract

**Files:**

- Create: `docs/superpowers/specs/2026-07-14-schema-metadata-docs-design.md`
- Create: `docs/superpowers/plans/2026-07-14-schema-metadata-docs.md`
- Verify: `packages/docs/src/content/docs/customization/schema-metadata.mdx`
- Verify: `packages/docs/src/components/examples/schema-metadata.tsx`
- Verify: `packages/docs/src/content/docs/guides/best-practices.mdx`
- Verify: `packages/docs/src/content/docs/reference/example.mdx`
- Verify: `packages/docs/package.json`

**Interfaces:**

- Consumes: the approved design in `docs/superpowers/specs/2026-07-14-schema-metadata-docs-design.md`.
- Produces: an executable structural contract for the new canonical page and dependency-free example.

- [x] **Step 1: Run the structural contract before implementation**

```bash
node --input-type=module <<'NODE'
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(
  "packages/docs/src/content/docs/customization/schema-metadata.mdx",
  "utf8",
);
const example = readFileSync(
  "packages/docs/src/components/examples/schema-metadata.tsx",
  "utf8",
);
const bestPractices = readFileSync(
  "packages/docs/src/content/docs/guides/best-practices.mdx",
  "utf8",
);
const referenceExample = readFileSync(
  "packages/docs/src/content/docs/reference/example.mdx",
  "utf8",
);
const packageJson = JSON.parse(readFileSync("packages/docs/package.json", "utf8"));

assert.match(page, /^title: Schema Metadata$/m);
assert.match(page, /<SchemaMetadataExample client:load \/>/);
assert.doesNotMatch(example, /@mui|theme-mui-material/);
assert.match(example, /z\.globalRegistry\.get\(option\.value\.fieldSchema\)/);
assert.match(example, /useView\("components"\)/);
assert.match(bestPractices, /\/fn-sphere\/customization\/schema-metadata\//);
assert.doesNotMatch(bestPractices, /^## Using Schema Metadata$/m);
assert.doesNotMatch(referenceExample, /SchemaMetadataFieldIcons|Field Icons from Schema Metadata/);
assert.equal(packageJson.devDependencies["@mui/icons-material"], undefined);
NODE
```

Expected: FAIL with `ENOENT` for `customization/schema-metadata.mdx`, proving that the new documentation contract is not already satisfied.

- [x] **Step 2: Confirm the baseline documentation type check**

Run: `pnpm --filter docs typeCheck`

Expected: exit 0 with 0 errors. The three existing `filterRuleToSQL` deprecation hints may remain.

- [x] **Step 3: Commit the approved design and plan**

```bash
git add docs/superpowers/specs/2026-07-14-schema-metadata-docs-design.md docs/superpowers/plans/2026-07-14-schema-metadata-docs.md
git commit -m "docs: plan schema metadata guide restructure"
```

### Task 2: Replace the MUI recipe with a native FieldSelect consumer

**Files:**

- Delete: `packages/docs/src/components/examples/schema-metadata-field-icons.tsx`
- Create: `packages/docs/src/components/examples/schema-metadata.tsx`
- Modify: `packages/docs/package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: `useFilterSelect(rule)`, `useView("components")`, `createFilterTheme()`, `FilterTheme["templates"]["FieldSelect"]`, and `z.globalRegistry`.
- Produces: `SchemaMetadataExample`, a live Filter Builder whose native field selects display metadata-derived glyph prefixes.

- [x] **Step 1: Implement the native example**

Replace the old component with `schema-metadata.tsx` using this structure:

```tsx
import {
  createFilterGroup,
  createFilterTheme,
  createSingleFilter,
  FilterBuilder,
  FilterSphereProvider,
  useFilterSelect,
  useFilterSphere,
  useView,
  type FilterField,
  type FilterTheme,
} from "@fn-sphere/filter";
import { useCallback } from "react";
import { z } from "zod";

type IconName = "user" | "email" | "number" | "calendar";

declare module "zod" {
  interface GlobalMeta {
    icon?: IconName;
  }
}

const schema = z.object({
  name: z.string().min(1).meta({ description: "Name", icon: "user" }),
  email: z.string().meta({ description: "Email", icon: "email" }),
  age: z.number().meta({ description: "Age", icon: "number" }),
  createdAt: z.date().meta({ description: "Created At", icon: "calendar" }),
  notes: z.string().meta({ description: "Notes" }),
});

const iconGlyphs = {
  user: "👤",
  email: "✉️",
  number: "#️⃣",
  calendar: "📅",
} satisfies Record<IconName, string>;

const MetadataFieldSelect: FilterTheme["templates"]["FieldSelect"] = ({
  rule,
  tryRetainArgs = true,
  tryRetainFilter = true,
  autoSelectFirstFilter = true,
  ...props
}) => {
  const { Select } = useView("components");
  const { selectedField, fieldOptions, setField } = useFilterSelect(rule);
  const options = fieldOptions.map((option) => {
    const iconName = z.globalRegistry.get(option.value.fieldSchema)?.icon;
    const glyph = iconName ? iconGlyphs[iconName] : undefined;

    return {
      ...option,
      label: glyph ? `${glyph} ${option.label}` : option.label,
    };
  });

  const handleChange = useCallback(
    (field: FilterField) => {
      setField(field, {
        tryRetainArgs,
        tryRetainFilter,
        autoSelectFirstFilter,
      });
    },
    [autoSelectFirstFilter, setField, tryRetainArgs, tryRetainFilter],
  );

  return (
    <Select
      aria-label="Field"
      onChange={handleChange}
      options={options}
      value={selectedField}
      {...props}
    />
  );
};

const theme = createFilterTheme({
  templates: { FieldSelect: MetadataFieldSelect },
});

const defaultRule = createFilterGroup({
  op: "and",
  conditions: [
    createSingleFilter({ path: ["name"], name: "contains", args: ["Ada"] }),
    createSingleFilter({
      path: ["email"],
      name: "contains",
      args: ["example.com"],
    }),
    createSingleFilter({
      path: ["notes"],
      name: "contains",
      args: ["Follow up"],
    }),
  ],
});

export function SchemaMetadataExample() {
  const { context } = useFilterSphere({ schema, defaultRule });

  return (
    <div className="overflow-x-auto p-4">
      <FilterSphereProvider context={context} theme={theme}>
        <FilterBuilder />
      </FilterSphereProvider>
    </div>
  );
}
```

- [x] **Step 2: Remove the direct icon dependency**

Delete `"@mui/icons-material": "^9.0.0"` from `packages/docs/package.json`. Run `pnpm install --lockfile-only` to remove the docs importer entry while retaining icon packages needed by the MUI theme workspace package.

- [x] **Step 3: Run focused type checking**

Run: `pnpm --filter docs typeCheck`

Expected: exit 0 with 0 errors. The three existing `filterRuleToSQL` deprecation hints may remain.

- [x] **Step 4: Commit the native example**

```bash
git add packages/docs/src/components/examples/schema-metadata.tsx packages/docs/src/components/examples/schema-metadata-field-icons.tsx packages/docs/package.json pnpm-lock.yaml
git commit -m "refactor(docs): remove MUI from metadata example"
```

### Task 3: Make the Customization guide canonical

**Files:**

- Create: `packages/docs/src/content/docs/customization/schema-metadata.mdx`
- Modify: `packages/docs/src/content/docs/guides/best-practices.mdx`
- Modify: `packages/docs/src/content/docs/reference/example.mdx`
- Modify: `packages/docs/src/content/docs/customization/localization.mdx`
- Modify: `packages/docs/src/content/docs/customization/theme.mdx`

**Interfaces:**

- Consumes: `SchemaMetadataExample` from `~/components/examples/schema-metadata.tsx`.
- Produces: `/fn-sphere/customization/schema-metadata/` as the canonical metadata guide and related links from adjacent documentation.

- [x] **Step 1: Create the canonical guide**

Create `schema-metadata.mdx` with the following content:

````mdx
---
title: Schema Metadata
description: Attach typed metadata to Zod schemas and consume it in custom filter UI
---

import SourceCodeCard from "~/components/source-code-card.astro";

Zod schema metadata lets your application attach configuration to a field and read it wherever that schema is available. Filter Sphere exposes each field's original schema, so custom UI can consume metadata without changing filter rules or Filter Sphere's public APIs.

The data flow is:

`schema field .meta()` → `z.globalRegistry` → `FilterField.fieldSchema` → custom consumer

## Define Typed Metadata

Application-defined metadata keys can be type-checked by augmenting Zod's `GlobalMeta` interface. Keep the values independent from a specific rendering library. In this example, `icon` stores a semantic token rather than a React component:

```ts
import { z } from "zod";

type IconName = "user" | "email" | "number" | "calendar";

declare module "zod" {
  interface GlobalMeta {
    icon?: IconName;
  }
}

export const schema = z.object({
  name: z.string().min(1).meta({ description: "Name", icon: "user" }),
  email: z.string().meta({ description: "Email", icon: "email" }),
  age: z.number().meta({ description: "Age", icon: "number" }),
  createdAt: z.date().meta({ description: "Created At", icon: "calendar" }),
  notes: z.string().meta({ description: "Notes" }),
});
```

`description` is built-in Zod metadata. Keys such as `icon` are application conventions and are not part of the Filter Sphere API.

## Read Metadata from a Filter Field

Filter Sphere exposes the registered schema instance as `FilterField.fieldSchema`. Read it directly from Zod's global registry; no schema cast is needed:

```tsx
import { useFilterSelect, type FilterField } from "@fn-sphere/filter";
import { z } from "zod";

const getFieldIcon = (field: FilterField | undefined) =>
  field ? z.globalRegistry.get(field.fieldSchema)?.icon : undefined;

function FieldSelectOptions({ rule }) {
  const { selectedField, fieldOptions } = useFilterSelect(rule);
  const selectedIcon = getFieldIcon(selectedField);
  const options = fieldOptions.map((option) => ({
    ...option,
    icon: getFieldIcon(option.value),
  }));

  // Render selectedIcon and options with any UI technology.
}
```

The same approach works for labels, analytics identifiers, permissions, formatting hints, or other configuration owned by your application.

## Live Example

This example uses metadata to add different glyphs to a custom `FieldSelect`. It overrides only the `FieldSelect` template and reuses Filter Sphere's native `<select>`, so it has no UI-library dependency. The `notes` field intentionally has no `icon` and demonstrates the plain-label fallback.

import { SchemaMetadataExample } from "~/components/examples/schema-metadata.tsx";

<div className="not-content">
  <SchemaMetadataExample client:load />
</div>
<SourceCodeCard path="~/components/examples/schema-metadata.tsx" />

## Caveats

- Keep `.meta()` at the end of a schema construction chain. It returns the schema instance registered with that metadata, so the returned instance must be the one placed in the object shape.
- Store serializable, application-owned values such as semantic tokens. Resolve those tokens to components, glyphs, or other presentation inside the consumer.
- Metadata remains associated with the schema. Filter Sphere does not copy it into `SingleFilter` rules, and serializing a rule does not serialize schema metadata.
````

- [x] **Step 2: Remove duplicate sections and add canonical links**

In Best Practices, replace `## Using Schema Metadata` through its final visual-example link with:

```md
Descriptions are built-in Zod schema metadata. You can also define typed, application-owned metadata and consume it in custom filter UI. See [Schema Metadata](/fn-sphere/customization/schema-metadata/) for the complete pattern and live example.
```

Remove the complete `Field Icons from Schema Metadata` section from Reference Example. Update Localization's old Best Practices link to `/fn-sphere/customization/schema-metadata/`. Add a link after the Theme guide's `FieldSelect` bullet pointing readers to the same guide.

- [x] **Step 3: Run the structural contract and verify green**

Run the exact Node contract from Task 1 Step 1.

Expected: exit 0 with no assertion failures.

- [x] **Step 4: Format the changed content**

```bash
pnpm exec prettier --write \
  packages/docs/src/components/examples/schema-metadata.tsx \
  packages/docs/src/content/docs/customization/schema-metadata.mdx \
  packages/docs/src/content/docs/guides/best-practices.mdx \
  packages/docs/src/content/docs/reference/example.mdx \
  packages/docs/src/content/docs/customization/localization.mdx \
  packages/docs/src/content/docs/customization/theme.mdx \
  packages/docs/package.json \
  pnpm-lock.yaml \
  docs/superpowers/specs/2026-07-14-schema-metadata-docs-design.md \
  docs/superpowers/plans/2026-07-14-schema-metadata-docs.md
```

- [x] **Step 5: Commit the guide restructure**

```bash
git add packages/docs/src/content/docs/customization/schema-metadata.mdx packages/docs/src/content/docs/guides/best-practices.mdx packages/docs/src/content/docs/reference/example.mdx packages/docs/src/content/docs/customization/localization.mdx packages/docs/src/content/docs/customization/theme.mdx docs/superpowers/specs/2026-07-14-schema-metadata-docs-design.md docs/superpowers/plans/2026-07-14-schema-metadata-docs.md
git commit -m "docs: add schema metadata customization guide"
```

Execution note: Tasks 2 and 3 were committed together as `1acb826` because deleting the old example and removing its MDX import had to remain atomic for `astro check`.

### Task 4: Verify and refresh the pull request

**Files:**

- Verify: all files changed since `origin/main`
- External update: existing pull request description and screenshot

**Interfaces:**

- Consumes: the native example and canonical customization guide from Tasks 2 and 3.
- Produces: a verified branch and an accurate pull request presentation.

- [x] **Step 1: Verify formatting**

Run: `pnpm exec prettier --check` against the exact files listed in Task 3 Step 4.

Expected: all matched files use Prettier code style.

- [x] **Step 2: Verify dependencies**

Run: `pnpm install --frozen-lockfile`

Expected: exit 0 with the lockfile unchanged.

- [x] **Step 3: Verify docs diagnostics**

Run: `pnpm --filter docs typeCheck`

Expected: exit 0 with 0 errors. The three existing `filterRuleToSQL` deprecation hints may remain.

- [x] **Step 4: Verify the production build and internal links**

Run: `pnpm --filter docs build`

Expected: exit 0, the new schema metadata page is generated, and the Starlight link validator reports valid internal links.

- [x] **Step 5: Inspect the diff and page visually**

Run `git diff origin/main...HEAD --check` and inspect `git diff --stat origin/main...HEAD`. Open `/fn-sphere/customization/schema-metadata/` on the local docs server at desktop and narrow widths. Confirm glyph-bearing and fallback field labels are visible and controls do not overflow without horizontal scrolling support.

- [ ] **Step 6: Review, commit any verification fixes, and update the PR**

Use the code-review workflow against `origin/main`. Commit only verified fixes. Push the branch, update the PR description to describe the canonical customization page and native example, and replace any stale MUI screenshot with a current native-example screenshot uploaded through the PR editor rather than committed to Git.
