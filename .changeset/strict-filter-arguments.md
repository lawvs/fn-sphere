---
"@fn-sphere/filter": patch
---

Require identical argument types to retain filter input when switching fields or operators. Switching between enum and string arguments now clears the input in both directions, while numeric equality and comparison switches still retain it.
