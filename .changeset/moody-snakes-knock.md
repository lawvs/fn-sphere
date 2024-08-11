---
"@fn-sphere/filter": minor
---

- In `useFilterSelect`:
  - The `updateField` function has been deprecated and replaced with `setField` for clarity and consistency.
  - The `updateFilter` function has been deprecated and replaced with `setFilter`.
- In `useFilterRule`:
  - The `updateRule` function has been renamed to `setRule`
  - Added a new `duplicateRule` function to duplicate a rule.
  - Added a new `invertRule` function.
- In `useFilterGroup` and `useFilterRule`:
  - The parameter `SingleFilter` has been changed to `SingleFilterInput` for simplicity.
  - The parameter `FilterGroup` has been changed to `FilterGroupInput` for simplicity.
