import { useFilterSchemaContext } from "../hooks/use-filter-schema-context.js";
import { useView } from "../theme/hooks.js";

export const FilterBuilder = () => {
  const { FilterGroup } = useView("templates");
  const { filterRule } = useFilterSchemaContext();
  return <FilterGroup rule={filterRule} />;
};
