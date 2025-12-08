import { ColumnEditor } from "./column-editor";
import { FilterPanel } from "./filter-panel";
import { PlaygroundProvider } from "./state";

const ColumnsPanel = () => (
  <div className="rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 p-4 space-y-3">
    <h3 className="text-sm font-semibold">Columns</h3>
    <ColumnEditor />
  </div>
);

export const Playground = () => {
  return (
    <PlaygroundProvider>
      <div className="space-y-4">
        <ColumnsPanel />
        <FilterPanel />
      </div>
    </PlaygroundProvider>
  );
};
