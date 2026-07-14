import {
  createFilterGroup,
  createFilterTheme,
  createSingleFilter,
  FilterBuilder,
  FilterSphereProvider,
  useFilterSelect,
  useFilterSphere,
  useView,
  type FilterField,
  type FilterTheme,
} from "@fn-sphere/filter";
import { useCallback } from "react";
import { z } from "zod";

type IconName = "user" | "email" | "number" | "calendar";

declare module "zod" {
  interface GlobalMeta {
    icon?: IconName;
  }
}

const schema = z.object({
  name: z.string().min(1).meta({ description: "Name", icon: "user" }),
  email: z.string().meta({ description: "Email", icon: "email" }),
  age: z.number().meta({ description: "Age", icon: "number" }),
  createdAt: z.date().meta({ description: "Created At", icon: "calendar" }),
  notes: z.string().meta({ description: "Notes" }),
});

const iconGlyphs = {
  user: "👤",
  email: "✉️",
  number: "#️⃣",
  calendar: "📅",
} satisfies Record<IconName, string>;

const MetadataFieldSelect: FilterTheme["templates"]["FieldSelect"] = ({
  rule,
  tryRetainArgs = true,
  tryRetainFilter = true,
  autoSelectFirstFilter = true,
  ...props
}) => {
  const { Select } = useView("components");
  const { selectedField, fieldOptions, setField } = useFilterSelect(rule);
  const options = fieldOptions.map((option) => {
    const iconName = z.globalRegistry.get(option.value.fieldSchema)?.icon;
    const glyph = iconName ? iconGlyphs[iconName] : undefined;

    return {
      ...option,
      label: glyph ? `${glyph} ${option.label}` : option.label,
    };
  });

  const handleChange = useCallback(
    (field: FilterField) => {
      setField(field, {
        tryRetainArgs,
        tryRetainFilter,
        autoSelectFirstFilter,
      });
    },
    [autoSelectFirstFilter, setField, tryRetainArgs, tryRetainFilter],
  );

  return (
    <Select
      aria-label="Field"
      onChange={handleChange}
      options={options}
      value={selectedField}
      {...props}
    />
  );
};

const theme = createFilterTheme({
  templates: { FieldSelect: MetadataFieldSelect },
});

const defaultRule = createFilterGroup({
  op: "and",
  conditions: [
    createSingleFilter({ path: ["name"], name: "contains", args: ["Ada"] }),
    createSingleFilter({
      path: ["email"],
      name: "contains",
      args: ["example.com"],
    }),
    createSingleFilter({
      path: ["notes"],
      name: "contains",
      args: ["Follow up"],
    }),
  ],
});

export function SchemaMetadataExample() {
  const { context } = useFilterSphere({ schema, defaultRule });

  return (
    <div className="overflow-x-auto p-4">
      <FilterSphereProvider context={context} theme={theme}>
        <FilterBuilder />
      </FilterSphereProvider>
    </div>
  );
}
