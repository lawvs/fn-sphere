import { useFilterSchemaContext } from "../hooks/use-filter-schema-context.js";
import { useView } from "../theme/hooks.js";

export const FilterBuilder = () => {
  const { FilterGroup } = useView("templates");
  const { filterRule, filterMap } = useFilterSchemaContext();
  if (!Object.keys(filterMap).length) {
    console.error(
      "You need to wrap your filter with the FilterSphereProvider component",
    );
    return;
  }
  return <FilterGroup rule={filterRule} />;
};
