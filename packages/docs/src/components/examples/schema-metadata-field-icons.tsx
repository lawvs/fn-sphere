import {
  createFilterGroup,
  createSingleFilter,
  FilterBuilder,
  FilterSphereProvider,
  useFilterSelect,
  useFilterSphere,
  type FilterField,
  type FilterTheme,
} from "@fn-sphere/filter";
import { filterTheme as muiFilterTheme } from "@fn-sphere/theme-mui-material";
import CalendarIcon from "@mui/icons-material/CalendarMonthOutlined";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import NumberIcon from "@mui/icons-material/NumbersOutlined";
import UserIcon from "@mui/icons-material/PersonOutlined";
import MenuItem from "@mui/material/MenuItem";
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import { ThemeProvider, createTheme } from "@mui/material/styles";
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

const fieldIcons = {
  user: UserIcon,
  email: EmailIcon,
  number: NumberIcon,
  calendar: CalendarIcon,
} satisfies Record<IconName, typeof UserIcon>;

function FieldOptionContent({
  field,
  label,
}: {
  field: FilterField;
  label: string;
}) {
  const iconName = z.globalRegistry.get(field.fieldSchema)?.icon;
  const FieldIcon = iconName ? fieldIcons[iconName] : undefined;

  return (
    <span
      style={{
        alignItems: "center",
        display: "inline-flex",
        gap: 8,
      }}
    >
      {FieldIcon ? <FieldIcon aria-hidden fontSize="small" /> : null}
      <span>{label}</span>
    </span>
  );
}

const MetadataFieldSelect: FilterTheme["templates"]["FieldSelect"] = ({
  rule,
  tryRetainArgs = true,
  tryRetainFilter = true,
  autoSelectFirstFilter = true,
  className,
  style,
}) => {
  const { selectedField, fieldOptions, setField } = useFilterSelect(rule);
  const selectedIndex = fieldOptions.findIndex(
    (option) => option.value === selectedField,
  );
  const selectedValue = selectedIndex === -1 ? "" : String(selectedIndex);
  const selectedOption = fieldOptions[selectedIndex];

  const handleChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const option = fieldOptions[Number(event.target.value)];
      if (!option) return;

      setField(option.value, {
        tryRetainArgs,
        tryRetainFilter,
        autoSelectFirstFilter,
      });
    },
    [
      autoSelectFirstFilter,
      fieldOptions,
      setField,
      tryRetainArgs,
      tryRetainFilter,
    ],
  );

  return (
    <Select<string>
      className={className}
      displayEmpty
      onChange={handleChange}
      renderValue={(value) => {
        const option = value === "" ? undefined : fieldOptions[Number(value)];
        return option ? (
          <FieldOptionContent field={option.value} label={option.label} />
        ) : (
          "Select field"
        );
      }}
      SelectDisplayProps={{
        "aria-label": selectedOption?.label ?? "Select field",
      }}
      size="small"
      style={style}
      sx={{ minWidth: 150 }}
      value={selectedValue}
    >
      <MenuItem disabled value="">
        Select field
      </MenuItem>
      {fieldOptions.map((option, index) => (
        <MenuItem key={option.value.path.join(".")} value={String(index)}>
          <FieldOptionContent field={option.value} label={option.label} />
        </MenuItem>
      ))}
    </Select>
  );
};

const metadataIconTheme: FilterTheme = {
  ...muiFilterTheme,
  templates: {
    ...muiFilterTheme.templates,
    FieldSelect: MetadataFieldSelect,
  },
};

const defaultRule = createFilterGroup({
  op: "and",
  conditions: [
    createSingleFilter({
      path: ["name"],
      name: "contains",
      args: ["Ada"],
    }),
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

const materialTheme = createTheme();

export function SchemaMetadataFieldIcons() {
  const { context } = useFilterSphere({ schema, defaultRule });

  return (
    <ThemeProvider theme={materialTheme}>
      <ScopedCssBaseline sx={{ overflowX: "auto", padding: 2 }}>
        <FilterSphereProvider context={context} theme={metadataIconTheme}>
          <FilterBuilder />
        </FilterSphereProvider>
      </ScopedCssBaseline>
    </ThemeProvider>
  );
}
