import { createFilterGroup } from "@fn-sphere/core";
import { renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { toFilterMap, type FilterMap } from "../filter-map.js";
import { useFilterGroup } from "../hooks/use-filter-group.js";
import { useFilterSchemaContext } from "../hooks/use-filter-schema-context.js";

vi.mock("../hooks/use-filter-schema-context.js", () => ({
  useFilterSchemaContext: vi.fn(),
}));

test.each(["appendChildRule", "appendChildGroup"] as const)(
  "%s assigns the containing group's ID to the new node",
  (operation) => {
    const nested = createFilterGroup({ op: "and" });
    const root = createFilterGroup({ op: "and", conditions: [nested] });
    const filterMap = toFilterMap(root);
    const onFilterMapChange = vi.fn<(map: FilterMap) => void>();
    vi.mocked(useFilterSchemaContext).mockReturnValue({
      filterMap,
      filterableFields: [],
      onFilterMapChange,
    } as unknown as ReturnType<typeof useFilterSchemaContext>);
    const { result } = renderHook(() => useFilterGroup(nested));

    // Explicit input avoids unrelated default-field selection.
    if (operation === "appendChildRule") result.current.appendChildRule({});
    else result.current.appendChildGroup({ op: "and", conditions: [] });

    const updatedMap = onFilterMapChange.mock.calls[0]![0];
    const addedId = Object.keys(updatedMap).find((id) => !(id in filterMap))!;
    expect(updatedMap[addedId]?.parentId).toBe(nested.id);
  },
);
