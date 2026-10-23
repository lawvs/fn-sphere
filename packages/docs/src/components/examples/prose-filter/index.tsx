import { useState } from "react";
import {
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
  defaultGetLocaleText,
} from "@fn-sphere/filter";
import {
  createProseRule,
  expenseSchema,
  mapExpenseFilterName,
  proseFilters,
  type Expense,
} from "./schema";
import { messages, localeOptions, type ProseLocale } from "./locale";
import { proseTheme } from "./theme";

export function ProseFilter() {
  const [locale, setLocale] = useState<ProseLocale>("en-US");
  const dictionary = messages[locale];
  const t = (key: string) =>
    Object.hasOwn(dictionary, key)
      ? dictionary[key]!
      : defaultGetLocaleText(key);
  const [editorVersion, setEditorVersion] = useState(0);
  const [showJSON, setShowJSON] = useState(false);
  const { context, filterRule, reset } = useFilterSphere<Expense>({
    schema: expenseSchema,
    filterFnList: proseFilters,
    defaultRule: createProseRule,
    getLocaleText: t,
    mapFilterName: mapExpenseFilterName,
  });

  return (
    <FilterSphereProvider context={context} theme={proseTheme}>
      <section lang={locale} className="prose-editor" aria-label={t("title")}>
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
          <FilterBuilder />
        </div>
        <div className="prose-toolbar">
          <button
            className="prose-small-button"
            type="button"
            onClick={() => {
              reset(createProseRule());
              setEditorVersion((version) => version + 1);
            }}
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
            <code>{JSON.stringify({ filterRule }, null, 2)}</code>
          </pre>
        )}
        <p className="prose-help">{t("help")}</p>
        <p className="prose-help prose-help-secondary">{t("keyboardHelp")}</p>
      </section>
    </FilterSphereProvider>
  );
}
