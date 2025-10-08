import { describe, expectTypeOf, test } from "vitest";
import { z } from "zod";
import { defineTypedFn } from "./fn-sphere.js";

describe("defineTypedFn", () => {
  test("should work with complex schemas", () => {
    const presetSchema = z
      .object({
        id: z.number(),
        name: z.string(),
        age: z.number(),
        status: z.boolean(),
        gender: z.union([
          z.literal("male"),
          z.literal("female"),
          z.literal("other"),
        ]),
        detail: z.object({
          email: z.string().email(),
          birthday: z.date(),
        }),
      })
      .describe("User");

    type PresetData = z.infer<typeof presetSchema>;

    const luckUserFilter = defineTypedFn({
      name: "Luck User",
      define: z.function({ input: [presetSchema], output: z.boolean() }),
      implement: (value) => {
        return value.id < 10 && Math.random() > 0.5;
      },
    });

    expectTypeOf(luckUserFilter.implement).toEqualTypeOf<
      (input: PresetData) => boolean
    >();
  });
});
