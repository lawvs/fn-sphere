import type { FilterGroup } from "@fn-sphere/filter";

import * as Popover from "@radix-ui/react-popover";
import { useCallback, useState } from "react";
import { useTranslations } from "../../mocks";

import { cn } from "../../mocks";

import FilterPanel from "./filter-panel";

interface FilterButtonProperties {
  badge: number;
  className?: string | undefined;
  onApply?: (filterRule: FilterGroup) => void;
}

export default function FilterButton(
  properties: Readonly<FilterButtonProperties>,
) {
  const { badge, className, onApply } = properties;
  const t = useTranslations("components.filter");
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback((open: boolean) => {
    setOpen(open);
  }, []);

  const handleApply = useCallback(
    (filterRule: FilterGroup) => {
      handleOpenChange(false);
      onApply?.(filterRule);
    },
    [handleOpenChange, onApply],
  );

  const handleReset = useCallback(
    (filterRule: FilterGroup) => {
      onApply?.(filterRule);
    },
    [onApply],
  );

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          className={cn("btn-stroke btn-small flex-nowrap", className)}
          type="button"
        >
          <span className="icon-[material-symbols--filter-list] mr-1.5 text-base" />
          <span className="truncate">{t("allFilters")}</span>
          {badge > 0 && (
            <span className="ms-2.5 inline-flex size-4 items-center justify-center rounded-sm border border-n-1 bg-red-1 text-[0.625rem] font-semibold text-gray-900">
              {badge}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          aria-label="filter dialog"
          sideOffset={8}
          className={cn(
            "min-w-[20.25rem] space-y-2 rounded-sm border border-n-1 bg-white p-2 shadow-md outline-none",
            "radix-state-closed:animate-portalLeave radix-state-open:animate-portalEnter",
          )}
        >
          <FilterPanel onApply={handleApply} onReset={handleReset} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
