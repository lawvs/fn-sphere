---
"@fn-sphere/core": patch
"@fn-sphere/filter": patch
---

Preserve filter input when the new argument types accept the previous argument types, including numeric equality/comparison switches and enum-to-string switches. Export `isCompatibleType` from `@fn-sphere/core` to support these checks.
