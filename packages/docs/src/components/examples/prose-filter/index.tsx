import { useState, type PropsWithChildren } from "react";
import {
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
  useRootRule,
  defaultGetLocaleText,
  type FilterGroup,
} from "@fn-sphere/filter";
import { createDefaultGroup, expenseSchema, type Expense } from "./schema";
import { messages, localeOptions, type ProseLocale } from "./locale";
import { mapExpenseFilterName } from "./filter-locale";
import { proseTheme } from "./theme";

export function ProseFilter() {
  const [locale, setLocale] = useState<ProseLocale>("en-US");
  const dictionary = messages[locale];
  const { context, filterRule } = useFilterSphere<Expense>({
    schema: expenseSchema,
    defaultRule: createDefaultGroup,
    getLocaleText: (key) =>
      Object.hasOwn(dictionary, key)
        ? dictionary[key]!
        : defaultGetLocaleText(key),
    mapFilterName: mapExpenseFilterName,
  });

  return (
    <FilterSphereProvider context={context} theme={proseTheme}>
      <ExampleLayout locale={locale} onLocaleChange={setLocale}>
        <FilterBuilder key={locale} />
        <FilterJSON filterRule={filterRule} />
      </ExampleLayout>
    </FilterSphereProvider>
  );
}

type LocaleSelectProps = {
  locale: ProseLocale;
  onLocaleChange: (locale: ProseLocale) => void;
};

function ExampleLayout({
  locale,
  onLocaleChange,
  children,
}: PropsWithChildren<LocaleSelectProps>) {
  const { getLocaleText: t } = useRootRule();
  return (
    <section lang={locale} className="prose-editor" aria-label={t("title")}>
      <header className="prose-heading">
        <span className="prose-eyebrow">{t("title")}</span>
        <LocaleSelect locale={locale} onLocaleChange={onLocaleChange} />
      </header>
      <h3>{t("heading")}</h3>
      {children}
    </section>
  );
}

function LocaleSelect({ locale, onLocaleChange }: LocaleSelectProps) {
  const { getLocaleText: t } = useRootRule();
  return (
    <label className="prose-language">
      <span>{t("language")}</span>
      <select
        aria-label={t("language")}
        value={locale}
        onChange={(event) => onLocaleChange(event.target.value as ProseLocale)}
      >
        {localeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterJSON({ filterRule }: { filterRule: FilterGroup }) {
  const { getLocaleText: t } = useRootRule();
  const [showJSON, setShowJSON] = useState(false);
  return (
    <>
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
    </>
  );
}
