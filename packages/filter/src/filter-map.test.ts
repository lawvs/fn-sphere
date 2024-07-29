import { type FilterGroup, type FilterId } from "@fn-sphere/core";
import { describe, expect, it } from "vitest";
import { fromFilterMap, getDepthOfRule, toFilterMap } from "./filter-map.js";

describe("toFilterMap/fromFilterMap", () => {
  it("should toFilterMap handle FilterGroup", () => {
    const filterGroup: FilterGroup = {
      id: "1" as FilterId,
      type: "FilterGroup",
      op: "or",
      conditions: [],
    };
    expect(toFilterMap(filterGroup)).toMatchInlineSnapshot(`
      {
        "1": {
          "conditionIds": [],
          "id": "1",
          "op": "or",
          "parentId": "1",
          "type": "FilterGroup",
        },
      }
    `);
    expect(fromFilterMap(toFilterMap(filterGroup))).toEqual(filterGroup);
  });

  it("should toFilterMap handle nested FilterGroup", () => {
    const filterGroup: FilterGroup = {
      id: "1" as FilterId,
      type: "FilterGroup",
      op: "or",
      conditions: [
        {
          id: "2" as FilterId,
          type: "FilterGroup",
          op: "or",
          conditions: [
            {
              id: "3" as FilterId,
              type: "Filter",
              args: [],
            },
          ],
        },
      ],
    };
    expect(toFilterMap(filterGroup)).toMatchInlineSnapshot(`
      {
        "1": {
          "conditionIds": [
            "2",
          ],
          "id": "1",
          "op": "or",
          "parentId": "1",
          "type": "FilterGroup",
        },
        "2": {
          "conditionIds": [
            "3",
          ],
          "id": "2",
          "op": "or",
          "parentId": "1",
          "type": "FilterGroup",
        },
        "3": {
          "data": {
            "arguments": [],
            "id": "3",
            "type": "Filter",
          },
          "parentId": "2",
          "type": "Filter",
        },
      }
    `);
    expect(fromFilterMap(toFilterMap(filterGroup))).toEqual(filterGroup);
  });
});

describe("depth of rule", () => {
  it("should return 0 for root rule", () => {
    const filterMap = toFilterMap({
      id: "1" as FilterId,
      op: "or",
      type: "FilterGroup",
      conditions: [],
    });
    expect(getDepthOfRule(filterMap, "1" as FilterId)).toBe(0);
  });

  it("should throw error for invalid rule id", () => {
    const filterMap = toFilterMap({
      id: "1" as FilterId,
      op: "or",
      type: "FilterGroup",
      conditions: [],
    });
    expect(() => getDepthOfRule(filterMap, "2" as FilterId)).toThrowError();
  });

  it("should return 1 for nested rule", () => {
    const filterMap = toFilterMap({
      id: "1" as FilterId,
      op: "or",
      type: "FilterGroup",
      conditions: [
        {
          id: "2" as FilterId,
          op: "or",
          type: "FilterGroup",
          conditions: [],
        },
      ],
    });
    expect(getDepthOfRule(filterMap, "2" as FilterId)).toBe(1);
  });

  it("should return 1 for nested rule group", () => {
    const filterMap = toFilterMap({
      id: "1" as FilterId,
      op: "or",
      type: "FilterGroup",
      conditions: [
        {
          id: "2" as FilterId,
          op: "or",
          type: "FilterGroup",
          conditions: [],
        },
      ],
    });
    expect(getDepthOfRule(filterMap, "2" as FilterId)).toBe(1);
  });

  it("should return 2 for doubly nested rule", () => {
    const filterMap = toFilterMap({
      id: "1" as FilterId,
      op: "or",
      type: "FilterGroup",
      conditions: [
        {
          id: "2" as FilterId,
          op: "or",
          type: "FilterGroup",
          conditions: [
            {
              id: "3" as FilterId,
              op: "or",
              type: "FilterGroup",
              conditions: [],
            },
          ],
        },
      ],
    });
    expect(getDepthOfRule(filterMap, "3" as FilterId)).toBe(2);
  });
});
