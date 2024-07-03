import { createFilterSphere } from "./sphere.js";

export { createFilterPredicate } from "./predicate.js";
export { findFilterField } from "./pure.js";
export { createFilterSphere } from "./sphere.js";
export { countNumberOfRules } from "./utils.js";

export type FilterSphere = ReturnType<typeof createFilterSphere>;
