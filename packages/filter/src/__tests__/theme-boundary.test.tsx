import { cleanup, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";
import {
  FilterBuilder,
  FilterSphereProvider,
  FilterThemeProvider,
  createFilterTheme,
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

afterEach(() => {
  cleanup();
});

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

  it("preserves an outer FilterThemeProvider when FilterSphereProvider theme is omitted", () => {
    const outerTheme = createFilterTheme({
      components: {
        Button: ({ children, ...props }) => (
          <button data-custom-theme="outer" {...props}>
            {children}
          </button>
        ),
      },
    });

    const OuterThemeFilter = () => {
      const { context } = useFilterSphere({
        schema: z.object({ name: z.string() }),
      });

      return (
        <FilterThemeProvider theme={outerTheme}>
          <FilterSphereProvider context={context}>
            <FilterBuilder />
          </FilterSphereProvider>
        </FilterThemeProvider>
      );
    };

    render(<OuterThemeFilter />);

    expect(
      screen
        .getByRole("button", { name: "And" })
        .getAttribute("data-custom-theme"),
    ).toBe("outer");
  });
});
