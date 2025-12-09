---
"@fn-sphere/core": minor
---

Add error handling support to filter predicates

- Added `fallbackValue` parameter to control behavior when filter rules are not available or errors occur (defaults to `true`)
- Added `errorHandling` option with `catchError` and `logError` properties for configurable error handling (defaults to `{ catchError: true, logError: true }`)
- Renamed `createFilterPredicate` to `createUnsafeFilterPredicate` (internal use)
- New `createFilterPredicate` now safely handles errors by default
- When `fallbackValue` is `true`, items are included in filtered results on error; when `false`, items are excluded
