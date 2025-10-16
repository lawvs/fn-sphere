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
        className="inline-flex h-8 items-center justify-center px-3 text-xs font-bold text-black transition-colors border border-black rounded-sm bg-[#E44C55] fill-black hover:bg-[#E44C55]/90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#E44C55]"
        type="button"
        onClick={handleApply}
      >
        <span>{t("apply")}</span>
      </button>

      <button
        className="bg-white inline-flex h-8 items-center justify-center px-3 text-xs font-bold text-black transition-colors border border-black rounded-sm fill-black hover:bg-black hover:text-white hover:fill-white"
        type="button"
        onClick={handleReset}
      >
        {/* <span className="icon-[material-symbols--cancel] mr-1 text-sm" /> */}
        <span>{t("reset")}</span>
      </button>
    </div>
  );
}
