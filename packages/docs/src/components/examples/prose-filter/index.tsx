import { useState } from "react";
import {
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
} from "@fn-sphere/filter";
import { createDefaultGroup, expenseSchema, type Expense } from "./schema";
import { getLocaleConfig, type ProseLocale } from "./locales";
import { proseTheme } from "./theme";
import { Layout } from "./layout";
import { RulePreview } from "./rule-preview";

export function ProseFilter() {
  const [locale, setLocale] = useState<ProseLocale>("en-US");
  const { context, filterRule } = useFilterSphere<Expense>({
    schema: expenseSchema,
    defaultRule: createDefaultGroup,
    ...getLocaleConfig(locale),
  });

  return (
    <FilterSphereProvider context={context} theme={proseTheme}>
      <Layout locale={locale} onLocaleChange={setLocale}>
        <FilterBuilder key={locale} />
        <RulePreview filterRule={filterRule} />
      </Layout>
    </FilterSphereProvider>
  );
}
