import {
  createFilterGroup,
  createSingleFilter,
  type FilterGroup,
  useRootRule,
} from "@fn-sphere/filter";
import { useCallback, useMemo } from "react";
import { useTranslations } from "../../mocks";

import FilterInput from "./filter-input";

interface FilterPanelProperties {
  onApply: (filterRule: FilterGroup) => void;
  onReset: (filterRule: FilterGroup) => void;
}

export default function FilterPanel({
  onApply,
  onReset,
}: FilterPanelProperties) {
  const t = useTranslations("components.filter");
  const { rootRule, setRootRule } = useRootRule();
  const fieldRules = useMemo(
    () =>
      rootRule.conditions.filter((condition) => condition.type === "Filter"),
    [rootRule],
  );

  const handleApply = useCallback(() => {
    onApply(rootRule);
  }, [onApply, rootRule]);

  const handleReset = useCallback(() => {
    const newRootRule = createFilterGroup({
      op: rootRule.op,
      conditions: rootRule.conditions
        .filter((condition) => condition.type === "Filter")
        .map((rule) =>
          createSingleFilter({
            ...rule,
            // Clear the value
            args: [],
          }),
        ),
    });

    // Reset the filter
    setRootRule(newRootRule);
    onReset(newRootRule);
  }, [onReset, rootRule.conditions, rootRule.op, setRootRule]);

  return (
    <div className="flex flex-col space-y-2">
      {fieldRules.map((rule) => (
        <FilterInput key={rule.id} rule={rule} />
      ))}
      <button
        className="btn-red btn-small disabled:btn-disabled"
        type="button"
        onClick={handleApply}
      >
        <span>{t("apply")}</span>
      </button>

      <button
        className="btn-stroke btn-small"
        type="button"
        onClick={handleReset}
      >
        <span className="icon-[material-symbols--cancel] mr-1 text-sm" />
        <span>{t("reset")}</span>
      </button>
    </div>
  );
}
