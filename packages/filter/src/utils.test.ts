import type { FilterId, LooseFilterGroup } from "@fn-sphere/core";
import { describe, expect, it } from "vitest";
import { fromFilterMap, toFilterMap } from "./utils.js";

describe("toFilterMap/fromFilterMap", () => {
  it("should toFilterMap handle FilterGroup", () => {
    const filterGroup: LooseFilterGroup = {
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
          "type": "FilterGroup",
        },
      }
    `);
    expect(fromFilterMap(toFilterMap(filterGroup))).toEqual(filterGroup);
  });

  it("should toFilterMap handle nested FilterGroup", () => {
    const filterGroup: LooseFilterGroup = {
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
              arguments: [],
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
          "type": "FilterGroup",
        },
        "2": {
          "conditionIds": [
            "3",
          ],
          "id": "2",
          "op": "or",
          "type": "FilterGroup",
        },
        "3": {
          "arguments": [],
          "id": "3",
          "type": "Filter",
        },
      }
    `);
    expect(fromFilterMap(toFilterMap(filterGroup))).toEqual(filterGroup);
  });
});
