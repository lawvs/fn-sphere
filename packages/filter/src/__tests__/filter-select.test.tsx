import { createFilterGroup, createSingleFilter } from "@fn-sphere/core";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";
import {
  FilterSchemaProvider,
  useFilterSelect,
  useFilterSphere,
} from "../index.js";
import { useFilterSchemaContext } from "../hooks/use-filter-schema-context.js";

afterEach(cleanup);

const renderFilterSelect = (
  name = "equals",
  args: unknown[] = [42],
  fieldSchema: z.ZodType = z.number(),
) => {
  const initialRule = createSingleFilter({ path: ["amount"], name, args });
  const defaultRule = createFilterGroup({
    op: "and",
    conditions: [initialRule],
  });
  const schema = z.object({ amount: fieldSchema, label: z.string() });
  return renderHook(
    function useSelectedRule() {
      const { filterMap } = useFilterSchemaContext();
      const node = filterMap[initialRule.id];
      if (node?.type !== "Filter") throw new Error("Missing filter");
      return { rule: node.data, ...useFilterSelect(node.data) };
    },
    {
      wrapper: function Wrapper({ children }) {
        const { context } = useFilterSphere({ schema, defaultRule });
        return (
          <FilterSchemaProvider context={context}>
            {children}
          </FilterSchemaProvider>
        );
      },
    },
  );
};

const selectFilter = (
  selection: ReturnType<typeof useFilterSelect>,
  name: string,
  options?: Parameters<typeof selection.setFilter>[1],
) => {
  const target = selection.selectedField?.filterFnList.find(
    (filter) => filter.name === name,
  );
  if (!target) throw new Error(`Missing filter: ${name}`);
  act(() => selection.setFilter(target, options));
};

describe("useFilterSelect", () => {
  describe.each([
    ["number", z.number()],
    ["optional number", z.number().optional()],
    ["nullable number", z.number().nullable()],
    ["nullish number", z.number().nullish()],
  ])("with a %s field", (_, fieldSchema) => {
    it.each(
      ["equals", "notEqual"].flatMap((equality) =>
        [
          "greaterThan",
          "greaterThanOrEqual",
          "lessThan",
          "lessThanOrEqual",
        ].map((comparison) => [equality, comparison]),
      ),
    )("retains input when switching %s ↔ %s", (from, to) => {
      const { result } = renderFilterSelect(from, [42], fieldSchema);

      selectFilter(result.current, to);
      expect(result.current.rule.name).toBe(to);
      expect(result.current.rule.args).toEqual([42]);

      selectFilter(result.current, from);
      expect(result.current.rule.name).toBe(from);
      expect(result.current.rule.args).toEqual([42]);
    });
  });

  it.each([0, -1.5])("retains the numeric value %s", (value) => {
    const { result } = renderFilterSelect("equals", [value]);

    selectFilter(result.current, "lessThan");
    expect(result.current.rule.args).toEqual([value]);
  });

  it("resets input when argument retention is disabled", () => {
    const { result } = renderFilterSelect();

    selectFilter(result.current, "greaterThanOrEqual", {
      tryRetainArgs: false,
    });

    expect(result.current.rule.args).toEqual([]);
  });

  it("resets input when switching to a filter with no input", () => {
    const { result } = renderFilterSelect("equals", [42], z.number().nullish());

    selectFilter(result.current, "isEmpty");

    expect(result.current.rule.args).toEqual([]);
  });

  it("resets input when switching to a field with a different input type", () => {
    const { result } = renderFilterSelect();
    const field = result.current.filterableFields.find(
      (field) => field.path[0] === "label",
    );
    if (!field) throw new Error("Missing label field");

    act(() => result.current.setField(field));

    expect(result.current.rule.path).toEqual(["label"]);
    expect(result.current.rule.name).toBe("equals");
    expect(result.current.rule.args).toEqual([]);
  });
});
