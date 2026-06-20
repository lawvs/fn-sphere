import { cleanup, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";
import {
  FilterBuilder,
  FilterSphereProvider,
  FilterThemeProvider,
  createFilterTheme,
  presetTheme,
  presetThemeParts,
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

describe("preset theme parts", () => {
  it("exports the preset parts used by presetTheme", () => {
    expect(presetThemeParts.primitives).toBe(presetTheme.primitives);
    expect(presetThemeParts.components).toBe(presetTheme.components);
    expect(presetThemeParts.templates).toBe(presetTheme.templates);
    expect(presetThemeParts.dataInputViews).toBe(presetTheme.dataInputViews);
  });

  it("createFilterTheme uses presetThemeParts as defaults", () => {
    const theme = createFilterTheme({});

    expect(theme.primitives.select).toBe(presetThemeParts.primitives.select);
    expect(theme.components.Select).toBe(presetThemeParts.components.Select);
    expect(theme.templates.FilterSelect).toBe(
      presetThemeParts.templates.FilterSelect,
    );
    expect(theme.dataInputViews).toEqual(presetThemeParts.dataInputViews);
  });
});
