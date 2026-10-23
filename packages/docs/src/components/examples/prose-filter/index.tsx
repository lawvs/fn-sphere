import { useState } from "react";
import {
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
  defaultGetLocaleText,
} from "@fn-sphere/filter";
import { createDefaultGroup, expenseSchema, type Expense } from "./schema";
import { messages, type ProseLocale } from "./locale";
import { mapExpenseFilterName } from "./filter-locale";
import { proseTheme } from "./theme";
import { Layout } from "./layout";
import { FilterJSON } from "./filter-json";

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
      <Layout locale={locale} onLocaleChange={setLocale}>
        <FilterBuilder key={locale} />
        <FilterJSON filterRule={filterRule} />
      </Layout>
    </FilterSphereProvider>
  );
}
