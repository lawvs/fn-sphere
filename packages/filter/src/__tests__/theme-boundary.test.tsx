import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
  useView,
} from "../index.js";

const DefaultThemeFilter = () => {
  const { context } = useFilterSphere({
    schema: z.object({ name: z.string() }),
  });

  return (
    <FilterSphereProvider context={context}>
      <FilterBuilder />
    </FilterSphereProvider>
  );
};

describe("theme boundary", () => {
  it("requires an explicit theme provider for theme hooks", () => {
    expect(() => renderHook(() => useView("templates"))).toThrow(
      "useFilterTheme must be used within FilterThemeProvider",
    );
  });

  it("FilterSphereProvider supplies the preset theme when theme is omitted", () => {
    render(<DefaultThemeFilter />);

    expect(screen.getByRole("button", { name: "And" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add Rule" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add Group" })).toBeTruthy();
  });
});
