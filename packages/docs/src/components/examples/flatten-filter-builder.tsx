import {
  createFilterGroup,
  createFilterTheme,
  createSingleFilter,
  FilterBuilder,
  FilterSphereProvider,
  useFilterRule,
  useFilterSphere,
  useRootRule,
  useView,
} from "@fn-sphere/filter";
import { schema } from "./utils";

const theme = createFilterTheme({
  primitives: {
    button: ({ className, ...props }) => (
      <button
        className={[
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-10 px-4 py-2",
          className,
        ].join(" ")}
        {...props}
      />
    ),
    input: ({ className, ...props }) => (
      <input
        className={[
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 min-w-16",
          "dark:border-gray-700",
          className,
        ].join(" ")}
        {...props}
      />
    ),
    select: ({ className, ...props }) => (
      <select
        className={[
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-gray-700",
          className,
        ].join(" ")}
        {...props}
      />
    ),
  },
  templates: {
    SingleFilter: ({ rule }) => {
      const {
        ruleState: { isLastRule, isValid, parentGroup },
        removeRule,
        appendRule,
      } = useFilterRule(rule);
      const { rootRule, numberOfRules, updateRootRule } = useRootRule();
      const { Button: ButtonView } = useView("components");
      const { FieldSelect, FilterSelect, FilterDataInput } =
        useView("templates");

      const isLastRuleInGroup =
        isLastRule &&
        rootRule.conditions[rootRule.conditions.length - 1]?.id ===
          parentGroup.id;

      return (
        <div className="flex items-center gap-2">
          <FieldSelect rule={rule} />
          <FilterSelect rule={rule} />
          <FilterDataInput rule={rule} />

          <ButtonView
            onClick={() => {
              appendRule(createSingleFilter());
            }}
          >
            And
          </ButtonView>
          {isLastRuleInGroup && (
            <ButtonView
              onClick={() => {
                rootRule.conditions.push(
                  createFilterGroup({
                    op: "and",
                    conditions: [createSingleFilter()],
                  }),
                );
                updateRootRule(rootRule);
              }}
            >
              Or
            </ButtonView>
          )}
          {isValid ? null : <div>⚠</div>}
          {numberOfRules > 1 && (
            <button
              className="transition-opacity opacity-70 hover:opacity-100 bg-transparent border-none cursor-pointer"
              onClick={() => removeRule(true)}
            >
              &#x2715;
            </button>
          )}
        </div>
      );
    },
    FilterGroupContainer: ({ children }) => (
      <div className="flex flex-col items-start">{children}</div>
    ),
    RuleJoiner: ({ joinBetween: [before, after], parent }) => {
      const { Button: ButtonView } = useView("components");
      const op = parent.op === "and" ? "And" : "Or";
      if (before.type === "Filter" && after.type === "Filter") {
        return (
          <div className="flex flex-col items-center justify-center">
            <div className="h-3 w-0.5 rounded-md bg-[#f5f5f4] dark:bg-[#292524]" />
            <ButtonView disabled>{op}</ButtonView>
            <div className="h-3 w-0.5 rounded-md bg-[#f5f5f4] dark:bg-[#292524]" />
          </div>
        );
      }
      return (
        <ButtonView disabled className="my-4">
          {op}
        </ButtonView>
      );
    },
  },
});

const createFlattenFilterGroup = () =>
  createFilterGroup({
    op: "or",
    conditions: [
      createFilterGroup({
        op: "and",
        conditions: [createSingleFilter(), createSingleFilter()],
      }),
      createFilterGroup({
        op: "and",
        conditions: [createSingleFilter()],
      }),
    ],
  });

export function FlattenFilter() {
  const { context } = useFilterSphere({
    schema,
    defaultRule: createFlattenFilterGroup(),
  });
  return (
    <FilterSphereProvider context={context} theme={theme}>
      <FilterBuilder />
    </FilterSphereProvider>
  );
}
