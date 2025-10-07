import type { FilterField } from "@fn-sphere/core";
import { describe, expect, it } from "vitest";
import z from "zod";
import { defaultMapFieldName } from "./utils.js";

describe("defaultMapFieldName", () => {
  it("should the schema description be registered to the global registry", () => {
    const schema = z.string().describe("User name");
    const field: FilterField = {
      path: ["name"],
      fieldSchema: schema,
      filterFnList: [],
    };

    const registryEntry = z.globalRegistry.get(schema);

    try {
      expect(z.globalRegistry.has(schema)).toBe(true);
      expect(registryEntry?.description).toBe("User name");
      expect(defaultMapFieldName(field)).toBe(registryEntry?.description);
      expect(registryEntry).toMatchInlineSnapshot(`
        {
          "description": "User name",
        }
      `);
    } finally {
      z.globalRegistry.remove(schema);
    }
  });
});
