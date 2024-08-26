import {
  createFilterTheme,
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
  type FilterTheme,
} from "@fn-sphere/filter";
import { z } from "zod";

const schema = z.object({
  id: z.number(),
  name: z.string(),
  checked: z.boolean(),
  createdAt: z.date(),
  status: z.union([
    z.literal("pending"),
    z.literal("completed"),
    z.literal("cancelled"),
  ]),
});

const presetTheme = createFilterTheme({});

export function ThemeAnatomy({ target }: { target: keyof FilterTheme }) {
  const { context } = useFilterSphere({ schema });

  const components = Object.keys(presetTheme[target]).reduce((acc, key) => {
    acc[key] = (props: any) => {
      // @ts-expect-error
      const Comp = presetTheme[target][key];
      return (
        <div
          style={{
            position: "relative",
            border: "1px solid transparent",
            marginTop: "16px",
            marginRight: "16px",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.border = "1px solid red";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.border = "1px solid transparent";
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              transform: "translate(0%, -100%)",
              fontSize: "12px",
              color: "gray",
              cursor: "default",
            }}
          >
            {key}
          </span>
          <Comp {...props} />
        </div>
      );
    };
    return acc;
  }, {} as any);

  const debugTheme = {
    ...presetTheme,
    [target]: components,
  };

  return (
    <div
      className="not-content"
      style={{
        marginTop: "2rem",
      }}
    >
      <FilterSphereProvider context={context} theme={debugTheme}>
        <FilterBuilder />
      </FilterSphereProvider>
    </div>
  );
}
