---
"@fn-sphere/filter": patch
---

Refactored filter theme boundaries to avoid preset theme import cycles while preserving default theme fallback and outer-provider behavior.

Note: theme hooks such as `useView` and `useDataInputView` now require a `FilterThemeProvider` or `FilterSphereProvider` in scope. Code that called these hooks outside a theme provider previously fell back to `presetTheme`; it will now throw instead.
