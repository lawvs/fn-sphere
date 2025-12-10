---
"@fn-sphere/filter": minor
---

Add ErrorBoundary component

- Added `ErrorBoundary` component to the theme components for handling rendering errors in filter UI
- `ErrorBoundary` wraps `FilterGroupContainer` and `SingleFilterContainer` to catch and handle errors gracefully
- Provides delete functionality to remove error-causing filter rules or groups via `onDelete` callback
- Displays user-friendly error fallback UI with error message and delete button
