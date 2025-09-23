---
"@fn-sphere/filter": minor
---

feat(filter)!: retain args by default when filter changes via tryRetainArgs

- BREAKING: FieldSelect and FilterSelect now default `tryRetainArgs` (and `tryRetainFilter` for fields) to `true`. Previously, leaving these props undefined defaulted to resetting `args`. To restore the old behavior, explicitly pass `tryRetainArgs={false}` (and/or `tryRetainFilter={false}`).
- When switching filters within the same field, if the new filter's parameter schema is compatible, existing `args` are preserved.
- Data input "literal union" options are memoized for stability.

This change improves UX by avoiding unnecessary argument resets when changing a filter, while still allowing users to opt out.
