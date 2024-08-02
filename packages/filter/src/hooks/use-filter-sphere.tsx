import { createFilterPredicate } from "@fn-sphere/core";
import type { z } from "zod";
import { useFilterSchemaContext } from "./use-filter-schema-context.js";

/**
 *
 * Provides a predicate function that can be used to filter data.
 *
 * Must be used within a `FilterSchemaProvider` or `FilterSphereProvider` component.
 *
 * @example
 * ```
 * const { rule, schema, predicate } = useFilterSphere<YourData>();
 * const filteredData = data.filter(predicate);
 * ```
 */
export const useFilterSphere = <Data,>() => {
  const { filterRule, schema, filterList } = useFilterSchemaContext();
  const typedSchema = schema as z.ZodType<Data>;
  const predicate = createFilterPredicate({
    filterList,
    schema: typedSchema,
    filterRule,
  });
  return { filterRule, schema, predicate };
};
