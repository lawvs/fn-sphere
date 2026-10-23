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
    { from: "enumEquals", to: "startsWith", expectedArgs: ["open"] },
    { from: "startsWith", to: "enumEquals", expectedArgs: [] },
  ])(
    "should retain only compatible args when switching $from to $to",
    ({ from, to, expectedArgs }) => {
      const initialRule = createSingleFilter({
        path: ["status"],
        name: from,
        args: ["open"],
      });
      const defaultRule = createFilterGroup({
        op: "and",
        conditions: [initialRule],
      });
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
              schema: z.object({ status: z.enum(["open", "closed"]) }),
              defaultRule,
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
        (filter) => filter.name === to,
      )!;

      act(() => result.current.setFilter(filter));

      expect(result.current.rule).toMatchObject({
        name: to,
        args: expectedArgs,
      });
    },
  );

  it.each([
    ["equals", "greaterThanOrEqual"],
    ["notEqual", "lessThan"],
  ])(
    "should retain numeric args when switching %s to %s and back",
    (from, to) => {
      const initialRule = createSingleFilter({
        path: ["amount"],
        name: from,
        args: [42],
      });
      const defaultRule = createFilterGroup({
        op: "and",
        conditions: [initialRule],
      });
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
              schema: z.object({ amount: z.number() }),
              defaultRule,
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

        expect(result.current.rule).toMatchObject({ name, args: [42] });
      }
    },
  );
});
