import {
  createFilterSphere,
  getParametersExceptFirst,
  presetFilter,
} from "@fn-sphere/core";
import { cleanup, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";
import * as filterExports from "../index.js";
import {
  FilterBuilder,
  FilterSphereProvider,
  FilterThemeProvider,
  createFilterTheme,
  presetDataInputSpecs,
  presetTheme,
  useDataInputView,
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

describe("preset theme", () => {
  it("does not expose a duplicate preset theme parts alias", () => {
    expect("presetThemeParts" in filterExports).toBe(false);
  });

  it("createFilterTheme uses presetTheme as defaults", () => {
    const theme = createFilterTheme({});

    expect(theme.primitives.select).toBe(presetTheme.primitives.select);
    expect(theme.components.Select).toBe(presetTheme.components.Select);
    expect(theme.templates.FilterSelect).toBe(
      presetTheme.templates.FilterSelect,
    );
    expect(theme.dataInputViews).toEqual(presetTheme.dataInputViews);
  });
});

describe("nullish field data input views", () => {
  const schema = z.object({
    text: z.string().optional(),
    count: z.number().nullable(),
    createdAt: z.date().nullish(),
    status: z.enum(["draft", "published"]).nullable(),
    kind: z.union([z.literal("internal"), z.literal("external")]).optional(),
  });
  const fields = createFilterSphere(schema, presetFilter).findFilterableField();

  it.each([
    {
      path: "text",
      filterName: "startsWith",
      expectedView: "string",
    },
    {
      path: "count",
      filterName: "greaterThan",
      expectedView: "number",
    },
    {
      path: "createdAt",
      filterName: "before",
      expectedView: "date",
    },
    {
      path: "text",
      filterName: "isEmpty",
      expectedView: "no need input",
    },
    {
      path: "status",
      filterName: "enumEquals",
      expectedView: "enum",
    },
    {
      path: "kind",
      filterName: "equals",
      expectedView: "literal union",
    },
  ])(
    "uses the $expectedView view for $path/$filterName",
    ({ path, filterName, expectedView }) => {
      const field = fields.find(
        (candidate) =>
          candidate.path.length === 1 && candidate.path[0] === path,
      );
      const filter = field?.filterFnList.find(
        (candidate) => candidate.name === filterName,
      );
      if (!field || !filter) {
        throw new Error(`Missing ${path}/${filterName}`);
      }

      const { result } = renderHook(
        () =>
          useDataInputView(getParametersExceptFirst(filter), field.fieldSchema),
        {
          wrapper: ({ children }) => (
            <FilterThemeProvider theme={presetTheme}>
              {children}
            </FilterThemeProvider>
          ),
        },
      );

      expect(result.current).toBe(
        presetDataInputSpecs.find((spec) => spec.name === expectedView)?.view,
      );
    },
  );

  it("keeps a custom data input view ahead of preset views", () => {
    const CustomStringInput = () => <div>Custom string input</div>;
    const customTheme = createFilterTheme({
      dataInputViews: [
        {
          name: "custom string",
          match: [z.string()],
          view: CustomStringInput,
        },
      ],
    });
    const field = fields.find(
      (candidate) =>
        candidate.path.length === 1 && candidate.path[0] === "text",
    );
    const filter = field?.filterFnList.find(
      (candidate) => candidate.name === "startsWith",
    );
    if (!field || !filter) {
      throw new Error("Missing text/startsWith");
    }

    const { result } = renderHook(
      () =>
        useDataInputView(getParametersExceptFirst(filter), field.fieldSchema),
      {
        wrapper: ({ children }) => (
          <FilterThemeProvider theme={customTheme}>
            {children}
          </FilterThemeProvider>
        ),
      },
    );

    expect(result.current).toBe(CustomStringInput);
  });

  it("passes the original nullish field schema to a custom view predicate", () => {
    const OptionalFieldInput = () => <div>Optional field input</div>;
    const customTheme = createFilterTheme({
      dataInputViews: [
        {
          name: "optional field",
          match: (_parameterSchemas, fieldSchema) =>
            fieldSchema?._zod.def.type === "optional",
          view: OptionalFieldInput,
        },
      ],
    });
    const field = fields.find(
      (candidate) =>
        candidate.path.length === 1 && candidate.path[0] === "text",
    );
    const filter = field?.filterFnList.find(
      (candidate) => candidate.name === "startsWith",
    );
    if (!field || !filter) {
      throw new Error("Missing text/startsWith");
    }

    const { result } = renderHook(
      () =>
        useDataInputView(getParametersExceptFirst(filter), field.fieldSchema),
      {
        wrapper: ({ children }) => (
          <FilterThemeProvider theme={customTheme}>
            {children}
          </FilterThemeProvider>
        ),
      },
    );

    expect(result.current).toBe(OptionalFieldInput);
  });
});
