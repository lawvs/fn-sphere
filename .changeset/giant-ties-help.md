---
"@fn-sphere/core": patch
---

`getParametersExceptFirst` now returns an array instead of a Zod tuple.

```ts
import { getParametersExceptFirst } from "@fn-sphere/core";

const schema = {
  name: "test",
  define: z.function().args(z.number(), z.boolean()).returns(z.void()),
  implement: () => {},
};

isSameType(z.tuple(getParametersExceptFirst(schema)), z.tuple([z.boolean()]));
// true
```
