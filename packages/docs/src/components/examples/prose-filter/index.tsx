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
  const [showJSON, setShowJSON] = useState(false);
  const { context, filterRule } = useFilterSphere<Expense>({
    schema: expenseSchema,
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
        <div key={locale}>
          <FilterBuilder />
        </div>
        <div className="prose-toolbar">
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
      </section>
    </FilterSphereProvider>
  );
}
