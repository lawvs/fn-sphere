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
import { Table } from "../../table";
import { expenses } from "./data";

export function ProseFilter() {
  const [locale, setLocale] = useState<ProseLocale>("en-US");
  const { context, filterRule, predicate } = useFilterSphere<Expense>({
    schema: expenseSchema,
    defaultRule: createDefaultGroup,
    ...getLocaleConfig(locale),
  });

  return (
    <FilterSphereProvider context={context} theme={proseTheme}>
      <Layout locale={locale} onLocaleChange={setLocale}>
        <FilterBuilder key={locale} />
        <RulePreview filterRule={filterRule} />
        <Table
          schema={expenseSchema}
          data={expenses.filter(predicate)}
          className="not-content mt-4 max-h-80"
        />
      </Layout>
    </FilterSphereProvider>
  );
}
