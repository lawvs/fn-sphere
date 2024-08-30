import { presetFilter } from "@fn-sphere/core";
import { describe, expect, it } from "vitest";
import * as locales from "./index.js";

describe("translations", () => {
  const enKeys = Object.keys(locales.enUS);

  it.each(Object.keys(locales))(
    "locale %s has all translations defined",
    (locale) => {
      if (typeof locale !== "object") {
        return;
      }
      expect(Object.keys(locales[locale as keyof typeof locales])).toEqual(
        enKeys,
      );
    },
  );

  it("preset filter translations are defined", () => {
    presetFilter.forEach((filter) => {
      expect(enKeys).toContain(filter.name);
    });
  });
});
