---
"@fn-sphere/core": patch
---

Add support for Zod enum types in filter predicates. The `equals`, `notEqual`, `contains`, and `notContains` functions now work with `z.enum()` schemas.
