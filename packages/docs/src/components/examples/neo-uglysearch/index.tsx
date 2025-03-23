import {
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
} from "@fn-sphere/filter";
import { useState } from "react";
import { defaultRule, filterFnList, filterSchema } from "./schema";
import { theme } from "./theme";
import { filterRuleToMeilisearch } from "./transform";

// See https://github.com/saveweb/neo-uglysearch/tree/main/app/components/filter-sphere

export function NeoFilter() {
  const [query, setQuery] = useState<string>(
    filterRuleToMeilisearch(defaultRule),
  );
  const { context } = useFilterSphere({
    schema: filterSchema,
    defaultRule,
    filterFnList,
    onRuleChange: ({ filterRule }) => {
      const query = filterRuleToMeilisearch(filterRule);
      setQuery(query);
    },
  });
  return (
    <FilterSphereProvider context={context} theme={theme}>
      <FilterBuilder />

      <div className="mt-2 text-black relative flex flex-col items-start rounded-md border-2 border-black px-3 py-2 gap-2 bg-opacity bg-[#fff4e0]">
        <div>Meilisearch query:</div>
        <div>{query}</div>
      </div>
    </FilterSphereProvider>
  );
}
