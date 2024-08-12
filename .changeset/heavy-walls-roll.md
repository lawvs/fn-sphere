---
"@fn-sphere/filter": patch
---

`updateInput` in `DataInputViewProps` now use spread parameter to accept new values.

```diff
- updateInput([newValue]);
+ updateInput(newValue);
```
