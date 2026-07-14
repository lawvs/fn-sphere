# Schema Metadata Documentation Design

## Goal

Give schema metadata a dedicated, general-purpose customization guide while retaining a small live example that demonstrates one real consumer: a custom `FieldSelect` that reads field metadata and adds distinct field icons.

## Information Architecture

Create `packages/docs/src/content/docs/customization/schema-metadata.mdx` with the title `Schema Metadata`. The Customization sidebar is generated from the directory, so the page requires no manual sidebar configuration.

The page will explain, in this order:

1. What schema metadata is and when application code should use it.
2. How to augment Zod's `GlobalMeta` interface for typed, application-owned keys.
3. How to attach metadata with `.meta()`.
4. How Filter Sphere exposes the registered schema through `FilterField.fieldSchema`.
5. How a custom consumer reads metadata from `z.globalRegistry`.
6. A live `FieldSelect` customization as one example of that general data flow.
7. Schema identity and rule-serialization boundaries.

The page title and primary headings must remain about metadata. Field icons are an example, not the subject of the page.

## Live Example

The example must have no imports from MUI or `@fn-sphere/theme-mui-material`.

It will use Filter Sphere's preset native `<select>` implementation. A custom `templates.FieldSelect` will:

- call `useFilterSelect(rule)` for the selected field, available options, and `setField`;
- read each option's metadata with `z.globalRegistry.get(option.value.fieldSchema)`;
- map an application-owned semantic token such as `"user"` or `"email"` to a Unicode/emoji glyph;
- prefix the option's existing localized label with that glyph;
- pass the transformed string options to the preset `Select` component obtained through `useView("components")`;
- preserve all `FieldSelect` update options when calling `setField`;
- render fields without icon metadata as their plain label.

Metadata stores semantic tokens, not React components or UI-library objects. This keeps the schema independent from presentation technology and makes the example portable.

Native `<select>` is preferred over a custom listbox because it keeps the example focused and retains browser keyboard, focus, and mobile behavior. Its known tradeoff is that glyphs are part of the option text and emoji appearance can vary by platform.

## Content Migration

- Remove the full `Using Schema Metadata` section from Best Practices and leave a short link after `Define Descriptive Schemas`.
- Remove the metadata showcase from Reference Example because the dedicated customization guide becomes the canonical location.
- Update Localization's metadata link to the new page.
- Add a related link from the Theme guide's `FieldSelect` description.
- Rename the standalone component from the field-icon-specific name to `schema-metadata.tsx`.
- Remove the docs package's direct `@mui/icons-material` dependency and its direct lockfile entry. Other docs examples may continue using their existing MUI dependencies.

## Verification

The change is complete when:

- the new page is generated under `/fn-sphere/customization/schema-metadata/`;
- the example source contains no MUI or MUI-theme imports;
- metadata-bearing fields display different glyph-prefixed labels and a field without icon metadata displays only its label;
- old Best Practices and Reference Example sections no longer duplicate the guide;
- all internal links resolve;
- Prettier, docs type checking, and the production docs build pass;
- the local preview is visually inspected at desktop and narrow viewport widths.
