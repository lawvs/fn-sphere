/* eslint-disable react-hooks/rules-of-hooks, @eslint-react/rules-of-hooks */
import {
  createFilterGroup,
  createSingleFilter,
  type FilterId,
} from "@fn-sphere/core";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  FilterSchemaProvider,
  useFilterRule,
  useFilterSelect,
  useFilterSphere,
  useRootRule,
} from "../index.js";

afterEach(cleanup);

// see https://vitest.dev/api/vi.html#vi-mock
vi.mock(import("@fn-sphere/core"), async (importOriginal) => {
  let id = 1;
  beforeEach(() => {
    // reset id
    id = 1;
  });

  const mod = await importOriginal();
  return {
    ...mod,
    // replace some exports
    createSingleFilter: vi.fn((ruleInput) => ({
      ...mod.createSingleFilter(ruleInput),
      id: String(id++) as FilterId,
    })),
    createFilterGroup: vi.fn((groupInput) => ({
      ...mod.createFilterGroup(groupInput),
      id: String(id++) as FilterId,
    })),
    createDefaultRule: vi.fn((fields) => ({
      ...mod.createDefaultRule(fields),
      id: String(id++) as FilterId,
    })),
  };
});

describe("useFilterSphere", async () => {
  it("should return the total rule count and valid rule count correctly", async () => {
    // see https://testing-library.com/docs/react-testing-library/intro
    const { result } = renderHook(() =>
      useFilterSphere({
        schema: z.object({ name: z.string() }),
      }),
    );
    expect(result.current.totalRuleCount).toEqual(1);
    expect(result.current.validRuleCount).toEqual(0);
  });
});

describe("useFilterRule", async () => {
  it("should init state match snapshot", async () => {
    // @ts-expect-error just for test
    const { result } = renderHook(() => useFilterRule({ id: "1" }), {
      wrapper: ({ children }) => {
        const { context } = useFilterSphere({
          schema: z.object({ name: z.string() }),
        });
        return (
          <FilterSchemaProvider context={context}>
            {children}
          </FilterSchemaProvider>
        );
      },
    });

    expect(result.current.ruleState).toMatchInlineSnapshot(`
      {
        "depth": 1,
        "index": 0,
        "isFirstRule": true,
        "isInvert": undefined,
        "isLastRule": true,
        "isValid": false,
        "parentGroup": {
          "conditions": [
            {
              "args": [],
              "id": "1",
              "name": "equals",
              "path": [
                "name",
              ],
              "type": "Filter",
            },
          ],
          "id": "2",
          "op": "and",
          "type": "FilterGroup",
        },
      }
    `);
  });
});

describe("useFilterSelect", () => {
  it.each([
    ...[
      { fieldType: "number", fieldSchema: z.number() },
      { fieldType: "optional number", fieldSchema: z.number().optional() },
      { fieldType: "nullable number", fieldSchema: z.number().nullable() },
      { fieldType: "nullish number", fieldSchema: z.number().nullish() },
    ].flatMap((field) =>
      ["equals", "notEqual"].flatMap((from) =>
        [
          "greaterThan",
          "greaterThanOrEqual",
          "lessThan",
          "lessThanOrEqual",
        ].map((to) => ({ ...field, from, to, value: 42 })),
      ),
    ),
    ...[0, -1.5].map((value) => ({
      fieldType: "number",
      fieldSchema: z.number(),
      from: "equals",
      to: "lessThan",
      value,
    })),
  ])(
    "should retain args when switching $from to $to and back ($fieldType, $value)",
    ({ fieldSchema, from, to, value }) => {
      const initialRule = createSingleFilter({
        path: ["amount"],
        name: from,
        args: [value],
      });
      const defaultRule = createFilterGroup({
        op: "and",
        conditions: [initialRule],
      });
      const onRuleChange = vi.fn();
      const { result } = renderHook(
        () => {
          const { rootRule } = useRootRule();
          const rule = rootRule.conditions[0];
          if (rule?.type !== "Filter") throw new Error("Expected a filter");
          return { rule, ...useFilterSelect(rule) };
        },
        {
          wrapper: ({ children }) => {
            const { context } = useFilterSphere({
              schema: z.object({ amount: fieldSchema }),
              defaultRule,
              onRuleChange,
            });
            return (
              <FilterSchemaProvider context={context}>
                {children}
              </FilterSchemaProvider>
            );
          },
        },
      );

      for (const name of [to, from]) {
        const filter = result.current.selectedField!.filterFnList.find(
          (filter) => filter.name === name,
        )!;

        act(() => result.current.setFilter(filter));

        expect(result.current.rule).toMatchObject({ name, args: [value] });
        expect(
          onRuleChange.mock.lastCall?.[0].filterRule.conditions[0],
        ).toMatchObject({ name, args: [value] });
      }
    },
  );

  it.each([
    {
      reason: "argument retention is disabled",
      name: "greaterThanOrEqual",
      tryRetainArgs: false,
    },
    {
      reason: "the filter requires no input",
      name: "isEmpty",
      tryRetainArgs: true,
    },
  ])("should reset args when $reason", ({ name, tryRetainArgs }) => {
    const initialRule = createSingleFilter({
      path: ["amount"],
      name: "equals",
      args: [42],
    });
    const defaultRule = createFilterGroup({
      op: "and",
      conditions: [initialRule],
    });
    const onRuleChange = vi.fn();
    const { result } = renderHook(
      () => {
        const { rootRule } = useRootRule();
        const rule = rootRule.conditions[0];
        if (rule?.type !== "Filter") throw new Error("Expected a filter");
        return { rule, ...useFilterSelect(rule) };
      },
      {
        wrapper: ({ children }) => {
          const { context } = useFilterSphere({
            schema: z.object({ amount: z.number().nullish() }),
            defaultRule,
            onRuleChange,
          });
          return (
            <FilterSchemaProvider context={context}>
              {children}
            </FilterSchemaProvider>
          );
        },
      },
    );
    const filter = result.current.selectedField!.filterFnList.find(
      (filter) => filter.name === name,
    )!;

    act(() => result.current.setFilter(filter, { tryRetainArgs }));

    expect(result.current.rule).toMatchObject({ name, args: [] });
    expect(
      onRuleChange.mock.lastCall?.[0].filterRule.conditions[0],
    ).toMatchObject({ name, args: [] });
  });

  it("should reset args when the field input type changes", () => {
    const initialRule = createSingleFilter({
      path: ["amount"],
      name: "equals",
      args: [42],
    });
    const defaultRule = createFilterGroup({
      op: "and",
      conditions: [initialRule],
    });
    const onRuleChange = vi.fn();
    const { result } = renderHook(
      () => {
        const { rootRule } = useRootRule();
        const rule = rootRule.conditions[0];
        if (rule?.type !== "Filter") throw new Error("Expected a filter");
        return { rule, ...useFilterSelect(rule) };
      },
      {
        wrapper: ({ children }) => {
          const { context } = useFilterSphere({
            schema: z.object({ amount: z.number(), label: z.string() }),
            defaultRule,
            onRuleChange,
          });
          return (
            <FilterSchemaProvider context={context}>
              {children}
            </FilterSchemaProvider>
          );
        },
      },
    );
    const field = result.current.filterableFields.find(
      (field) => field.path[0] === "label",
    )!;

    act(() => result.current.setField(field));

    const expectedRule = { path: ["label"], name: "equals", args: [] };
    expect(result.current.rule).toMatchObject(expectedRule);
    expect(
      onRuleChange.mock.lastCall?.[0].filterRule.conditions[0],
    ).toMatchObject(expectedRule);
  });
});
