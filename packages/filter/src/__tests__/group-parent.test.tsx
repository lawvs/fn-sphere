import { createFilterGroup, createSingleFilter } from "@fn-sphere/core";
import { renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { toFilterMap, type FilterMap } from "../filter-map.js";
import { useFilterGroup } from "../hooks/use-filter-group.js";
import { useFilterSchemaContext } from "../hooks/use-filter-schema-context.js";

vi.mock("../hooks/use-filter-schema-context.js", () => ({
  useFilterSchemaContext: vi.fn(),
}));

function setup() {
  const nested = createFilterGroup({ op: "and", conditions: [] });
  const root = createFilterGroup({ op: "and", conditions: [nested] });
  const onFilterMapChange = vi.fn<(map: FilterMap) => void>();
  vi.mocked(useFilterSchemaContext).mockReturnValue({
    filterMap: toFilterMap(root),
    filterableFields: [],
    onFilterMapChange,
  } as unknown as ReturnType<typeof useFilterSchemaContext>);
  const { result } = renderHook(() => useFilterGroup(nested));
  return { nested, result, onFilterMapChange };
}

test("a condition appended to a nested group points to that group", () => {
  const { nested, result, onFilterMapChange } = setup();
  result.current.appendChildRule({
    path: ["amount"],
    name: "equals",
    args: [5],
  });
  const map = onFilterMapChange.mock.calls[0]![0];
  const group = map[nested.id]!;
  expect(group.type).toBe("FilterGroup");
  if (group.type !== "FilterGroup") throw new Error("Expected group");
  expect(map[group.conditionIds[0]!]?.parentId).toBe(nested.id);
});

test("an appended nested group and its child keep the full parent chain", () => {
  const { nested, result, onFilterMapChange } = setup();
  const child = createSingleFilter({
    path: ["amount"],
    name: "equals",
    args: [5],
  });
  result.current.appendChildGroup({ op: "or", conditions: [child] });
  const map = onFilterMapChange.mock.calls[0]![0];
  const group = map[nested.id]!;
  if (group.type !== "FilterGroup") throw new Error("Expected group");
  const addedId = group.conditionIds[0]!;
  expect(map[addedId]?.parentId).toBe(nested.id);
  expect(map[child.id]?.parentId).toBe(addedId);
});
