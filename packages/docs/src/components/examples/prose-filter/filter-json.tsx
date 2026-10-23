import { useState } from "react";
import { useRootRule, type FilterGroup } from "@fn-sphere/filter";

export function FilterJSON({ filterRule }: { filterRule: FilterGroup }) {
  const { getLocaleText: t } = useRootRule();
  const [showJSON, setShowJSON] = useState(false);
  return (
    <div className="prose-toolbar">
      <button
        className="prose-small-button prose-json-toggle"
        type="button"
        aria-expanded={showJSON}
        onClick={() => setShowJSON(!showJSON)}
      >
        {t(showJSON ? "hideJSON" : "showJSON")}
      </button>
      {showJSON && (
        <pre className="prose-json" aria-label={t("ruleJSON")}>
          <code>{JSON.stringify({ filterRule }, null, 2)}</code>
        </pre>
      )}
    </div>
  );
}
