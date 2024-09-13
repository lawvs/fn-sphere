import {
  createFilterGroup,
  createFilterTheme,
  createSingleFilter,
  FilterBuilder,
  FilterSphereProvider,
  useFilterGroup,
  useFilterRule,
  useFilterSphere,
  useView,
} from "@fn-sphere/filter";
import { z } from "zod";

const schema = z.object({
  id: z.number().describe("ID"),
  name: z.string().describe("Name"),
  createdAt: z.date().describe("Created At"),
  status: z
    .union([
      z.literal("pending"),
      z.literal("completed"),
      z.literal("cancelled"),
    ])
    .describe("Status"),
});

// Ported from [akumatus/FilterBuilder](https://github.com/akumatus/FilterBuilder)
// Licensed under MIT

const theme = createFilterTheme({
  primitives: {
    input: ({ ...props }) => {
      return (
        <input
          {...props}
          className="w-full px-2 py-1 h-[30px] border border-[#d2d6de] bg-white text-[#555] focus:border-[#3c8dbc] outline-none"
        />
      );
    },
    select: ({ ...props }) => {
      return (
        <select
          {...props}
          className="w-full p-1 border border-[#d2d6de] bg-white text-[#555] focus:border-[#3c8dbc] outline-none"
        />
      );
    },
  },
  templates: {
    FilterGroupContainer: ({ rule, children }) => {
      const {
        ruleState: { isRoot, isLastGroup },
        toggleGroupOp,
        appendChildGroup,
        appendChildRule,
        removeGroup,
      } = useFilterGroup(rule);
      const isAnd = rule.op === "and";
      return (
        <div
          className={[
            "flex flex-col gap-4 w-100 p-2 relative rounded-sm border border-solid border-[#6d77b8] border-t-4 border-t-[#6d77b8] mb-5 shadow-[0_1px_1px_rgba(0,0,0,0.1)] bg-[rgba(255,255,255,0.9)]",
            "before:content-[''] before:absolute before:left-[-17px] before:w-4 before:h-[calc(50%+18px)] before:border-solid before:border-[#c0c5e2] before:border-b-2 before:border-l-2 before:top-[-18px]",
            !isLastGroup
              ? "after:content-[''] after:absolute after:left-[-17px] after:w-4 after:h-[calc(50%+18px)] after:border-solid after:border-[#c0c5e2] after:border-l-2 after:top-[50%]"
              : "",
            isRoot ? "before:border-none after:border-none" : "ml-9",
          ].join(" ")}
        >
          <div className="flex justify-between">
            <div className="flex items-center gap-1">
              <button
                className={`flex justify-center items-center px-2 py-0.5 text-xs leading-[1.5] whitespace-nowrap cursor-pointer select-none rounded-[11px] border ${isAnd ? "text-white bg-[#6d77b8]" : "bg-white text-[#6d77b8] border-[#6d77b8]"}`}
                onClick={() => {
                  toggleGroupOp("and");
                }}
              >
                And
              </button>
              <button
                className={`flex justify-center items-center px-2 py-0.5 text-xs leading-[1.5] whitespace-nowrap cursor-pointer select-none rounded-[11px] border ${!isAnd ? "text-white bg-[#6d77b8]" : "bg-white text-[#6d77b8] border-[#6d77b8]"}`}
                onClick={() => {
                  toggleGroupOp("or");
                }}
              >
                Or
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                className={
                  "flex justify-center items-center px-2 py-0.5 text-xs leading-[1.5] whitespace-nowrap cursor-pointer select-none rounded-[3px] text-white bg-[#6d77b8]"
                }
                onClick={() => {
                  appendChildRule();
                }}
              >
                + add
              </button>
              <button
                className={
                  "flex justify-center items-center px-2 py-0.5 text-xs leading-[1.5] whitespace-nowrap cursor-pointer select-none rounded-[3px] text-white bg-[#6d77b8]"
                }
                onClick={() => {
                  appendChildGroup();
                }}
              >
                + ( group )
              </button>
              {isRoot ? null : (
                <button
                  className={[
                    "flex justify-center items-center px-2 py-0.5 text-xs leading-[1.5] whitespace-nowrap cursor-pointer select-none rounded-[3px] bg-[#6d77b8]",
                    // https://stackoverflow.com/questions/48152562/changing-font-color-of-html-symbol
                    // https://www.hyperui.dev/blog/text-shadow-with-tailwindcss
                    "text-transparent [text-shadow:_0_0_0_white]",
                  ].join(" ")}
                  onClick={() => {
                    removeGroup();
                  }}
                >
                  {/* Unicode character for "X" cancel / close https://stackoverflow.com/questions/5353461/unicode-character-for-x-cancel-close */}
                  &#x2716;
                </button>
              )}
            </div>
          </div>
          {children}
        </div>
      );
    },

    SingleFilter: ({ rule }) => {
      const {
        ruleState: { isLastRule },
        removeRule,
      } = useFilterRule(rule);
      const { FieldSelect, FilterSelect, FilterDataInput } =
        useView("templates");
      return (
        <div
          className={[
            "flex items-center gap-8 ml-9 relative",
            "before:content-[''] before:absolute before:-translate-x-full before:w-4 before:h-[calc(50%+17px)] before:border-solid before:border-[#c0c5e2] before:border-b-2 before:border-l-2 before:top-[-17px]",
            !isLastRule
              ? "after:content-[''] after:absolute after:-translate-x-full after:w-4 after:h-[calc(50%+17px)] after:border-solid after:border-[#c0c5e2] after:border-l-2 after:top-[50%]"
              : "",
          ].join(" ")}
        >
          <FieldSelect rule={rule} />
          <FilterSelect rule={rule} />
          <FilterDataInput rule={rule} />
          <button
            className="flex justify-center items-center aspect-square text-xs font-bold cursor-pointer rounded-full bg-white text-[#6d77b8] border border-[#6d77b8]"
            onClick={() => {
              removeRule();
            }}
          >
            {/* Unicode character for "X" cancel / close https://stackoverflow.com/questions/5353461/unicode-character-for-x-cancel-close */}
            &#x2715;
          </button>
        </div>
      );
    },
  },
});

export function AdvancedFilter() {
  const { context } = useFilterSphere({
    schema,
    defaultRule: createFilterGroup({
      op: "and",
      conditions: [
        createSingleFilter(),
        createFilterGroup({
          op: "or",
          conditions: [createSingleFilter()],
        }),
      ],
    }),
  });
  return (
    <FilterSphereProvider context={context} theme={theme}>
      <FilterBuilder />
    </FilterSphereProvider>
  );
}
