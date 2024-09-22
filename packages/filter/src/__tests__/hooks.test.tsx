/* eslint-disable react-hooks/rules-of-hooks */
import type { FilterId } from "@fn-sphere/core";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  FilterSchemaProvider,
  useFilterRule,
  useFilterSphere,
} from "../index.js";

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
