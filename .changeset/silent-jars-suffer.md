---
"@fn-sphere/filter": minor
---

Removed inline theme merging logic from `FilterSphereProvider`.

Introduced `createFilterTheme` for theme merging.

Migration guide:

```tsx
-  <FilterSphereProvider theme={customTheme}>
+ const theme = createFilterTheme(customTheme);
+  <FilterSphereProvider theme={theme}>
```
