---
"@fn-sphere/filter": patch
---

Update data input view to handle empty values

If input value is empty string, the input view will update the rule args to `[]` instead of `[""]`. This is to prevent the rule from running with an empty string as an argument.
