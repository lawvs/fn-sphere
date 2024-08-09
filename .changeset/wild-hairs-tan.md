---
"@fn-sphere/filter": patch
---

- Added the ability to retain the current filter and arguments when the field is changed in the `useFilterSelect` hook.
- Introduced the `UpdateFieldOptions` type to specify the behavior when updating the field.
- Updated the `FieldSelect` component to pass the `updateFieldOptions` to the `updateField` function.

```tsx
export type UpdateFieldOptions = {
  /**
   * Try to continue using the current filter when the field is changed.
   *
   * @default true
   */
  tryRetainFilter?: boolean;
  /**
   * Automatically select the first filter when the field is changed and the filter is not retained.
   *
   * @default true
   */
  autoSelectFirstFilter?: boolean;
  /**
   * Try to continue using the current args when the field is changed.
   *
   * @default true
   */
  tryRetainArgs?: boolean;
};

<FieldSelect rule={rule} tryRetainFilter autoSelectFirstFilter tryRetainArgs />;
```
