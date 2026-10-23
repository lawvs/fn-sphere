import { useReducer, useRef, useState, type KeyboardEvent } from "react";
import {
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
} from "@fn-sphere/filter";
import { createHistory, historyReducer, type HistoryAction } from "./model";
import { expenseSchema, proseFilters, type Expense } from "./schema";
import {
  getProseLocaleText,
  localeOptions,
  ProseLocaleContext,
  type ProseLocale,
} from "./locale";
import { proseTheme } from "./theme";
import "./prose-filter.css";

export function ProseFilter() {
  const [locale, setLocale] = useState<ProseLocale>("en-US");
  const t = (key: string) => getProseLocaleText(locale, key);
  const [history, dispatch] = useReducer(
    historyReducer,
    undefined,
    createHistory,
  );
  const [editorVersion, setEditorVersion] = useState(0);
  const [showJSON, setShowJSON] = useState(false);
  const editor = useRef<HTMLElement>(null);
  const { present } = history;
  const { context } = useFilterSphere<Expense>({
    schema: expenseSchema,
    filterFnList: proseFilters,
    ruleValue: present.filterRule,
    getLocaleText: t,
    mapFilterName: (filter) => `operator.${filter.name}`,
    onRuleChange: ({ filterRule }) =>
      dispatch({ type: "commit", document: { ...present, filterRule } }),
  });

  const travel = (type: "undo" | "redo" | "reset", restoreFocus = false) => {
    dispatch({ type } satisfies HistoryAction);
    setEditorVersion((version) => version + 1);
    if (restoreFocus) requestAnimationFrame(() => editor.current?.focus());
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (
      target.closest("input, textarea, [contenteditable='true']") ||
      !(event.metaKey || event.ctrlKey) ||
      event.altKey
    )
      return;
    const key = event.key.toLowerCase();
    const undo = key === "z" && !event.shiftKey;
    const redo =
      (key === "z" && event.shiftKey) || (key === "y" && event.ctrlKey);
    if ((undo && history.past.length) || (redo && history.future.length)) {
      event.preventDefault();
      event.stopPropagation();
      travel(undo ? "undo" : "redo", true);
    }
  };

  return (
    <ProseLocaleContext.Provider value={locale}>
      <section
        lang={locale}
        ref={editor}
        className="prose-editor"
        aria-label={t("title")}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <header className="prose-heading">
          <span className="prose-eyebrow">{t("title")}</span>
          <label className="prose-language">
            <span>{t("language")}</span>
            <select
              aria-label={t("language")}
              value={locale}
              onChange={(event) => {
                setLocale(event.target.value as ProseLocale);
                setEditorVersion((version) => version + 1);
              }}
            >
              {localeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </header>
        <h3>{t("heading")}</h3>
        <div key={editorVersion}>
          <FilterSphereProvider context={context} theme={proseTheme}>
            <FilterBuilder />
          </FilterSphereProvider>
        </div>
        <div className="prose-toolbar">
          <button
            className="prose-small-button"
            type="button"
            disabled={!history.past.length}
            onClick={() => travel("undo")}
          >
            {t("undo")}
          </button>
          <button
            className="prose-small-button"
            type="button"
            disabled={!history.future.length}
            onClick={() => travel("redo")}
          >
            {t("redo")}
          </button>
          <button
            className="prose-small-button"
            type="button"
            onClick={() => travel("reset")}
          >
            {t("reset")}
          </button>
          <button
            className="prose-small-button prose-json-toggle"
            type="button"
            aria-expanded={showJSON}
            onClick={() => setShowJSON(!showJSON)}
          >
            {t(showJSON ? "hideJSON" : "showJSON")}
          </button>
        </div>
        {showJSON && (
          <pre className="prose-json" aria-label={t("ruleJSON")}>
            <code>{JSON.stringify(present, null, 2)}</code>
          </pre>
        )}
        <p className="prose-help">{t("help")}</p>
        <p className="prose-help prose-help-secondary">{t("keyboardHelp")}</p>
      </section>
    </ProseLocaleContext.Provider>
  );
}
