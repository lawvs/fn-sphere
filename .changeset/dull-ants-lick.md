---
"@fn-sphere/core": patch
---

Fix `isValidRule` incorrectly returned `false` for functions with `skipValidate` enabled

Now, even if `skipValidate` is enabled, the input data is still checked for length.
