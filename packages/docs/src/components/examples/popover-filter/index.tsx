import { useCallback, useState } from "react";
import { z } from "zod";

import FilterBuilder from "./components/filter-sphere";

const filterSchema = z.object({
  ticket: z.number().describe("Ticket"),
  customer: z.string().describe("Customer"),
  status: z
    .union([
      z.literal("PENDING").describe("status.PENDING"),
      z.literal("COMPLETED").describe("status.COMPLETED"),
      z.literal("FAILED").describe("status.FAILED"),
    ])
    .describe("status.label"),
});

type FiltersParameters = z.infer<typeof filterSchema>;

const defaultFilters: Partial<FiltersParameters> = {
  status: "PENDING",
};

export function PopoverFilter() {
  const [activeFilters, setActiveFilters] =
    useState<Partial<FiltersParameters>>(defaultFilters);

  const handleFilterChange = useCallback(
    (filters: Partial<FiltersParameters>) => {
      setActiveFilters(filters);
    },
    [],
  );

  const apiPayload = Object.entries(activeFilters)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return (
    <div className="flex flex-col gap-4">
      <FilterBuilder
        className="self-start"
        defaultParameter={defaultFilters}
        schema={filterSchema}
        onFilterChange={handleFilterChange}
      />

      <div>
        <div className="text-sm text-gray-500">
          Active Filters: {JSON.stringify(activeFilters)}
        </div>
        <div className="text-sm text-gray-500">
          API Payload: /api/data?{apiPayload}
        </div>
      </div>
    </div>
  );
}
