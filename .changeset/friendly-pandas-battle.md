---
"@fn-sphere/filter": patch
---

Rename `updateRootRule` to `setRootRule` in `useRootRule` hook

Migration:

```diff
- const { updateRootRule } = useRootRule();
+ const { setRootRule } = useRootRule();
```
