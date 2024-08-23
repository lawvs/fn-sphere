---
"@fn-sphere/filter": minor
---

- BREAKING CHANGES

  - `updateInput` in `DataInputViewProps` now use spread parameter to accept new values.

  ```diff
  - updateInput([newValue]);
  + updateInput(newValue);
  ```
