---
"@fn-sphere/filter": patch
---

Deprecated `getRootRule` in favor of `rootRule` in `useRootRule` hook.

Migration:

```diff
+ const { rootRule } = useRootRule();
- const { getRootRule } = useRootRule();
```
