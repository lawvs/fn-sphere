import { type FilterId } from "@fn-sphere/core";
import type {
  BasicFilterSphereInput,
  FilterGroup,
  SingleFilter,
} from "@fn-sphere/filter";
import {
  createFilterGroup,
  createFilterTheme,
  createSingleFilter,
  FilterSphereProvider,
  useFilterSphere,
  useView,
} from "@fn-sphere/filter";
import { FlattenFilterGroupContainer } from "./filter-group-container";
import { FlattenSingleFilterView } from "./filter-rule";

interface FlattenFilterBuilderProps<
  Data = unknown,
> extends BasicFilterSphereInput<Data> {
  filterRule: FilterGroup;
  onRuleChange?: (value: {
    filterRule: FilterGroup;
    predicate: (data: Data) => boolean;
  }) => void;
}

export type FlattenFilterGroup = {
  id: FilterId;
  type: "FilterGroup";
  op: "or";
  conditions: {
    id: FilterId;
    type: "FilterGroup";
    op: "and";
    conditions: SingleFilter[];
  }[];
};

const isFlattenFilterGroup = (
  filterGroup: FilterGroup,
): filterGroup is FlattenFilterGroup => {
  if (filterGroup.op === "and") {
    return false;
  }

  return filterGroup.conditions.every(
    (group) =>
      group.type === "FilterGroup" &&
      group.op === "and" &&
      group.conditions.every((rule) => rule.type === "Filter"),
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const createFlattenFilterGroup = () =>
  createFilterGroup({
    op: "or",
    conditions: [
      createFilterGroup({
        op: "and",
        conditions: [createSingleFilter()],
      }),
    ],
  });

const theme = createFilterTheme({
  templates: {
    FilterGroupContainer: FlattenFilterGroupContainer,
    SingleFilter: FlattenSingleFilterView,
  },
});

export const FlattenFilterBuilder = <Data,>({
  filterRule,
  ...props
}: FlattenFilterBuilderProps<Data>) => {
  const { context, totalRuleCount } = useFilterSphere({
    ruleValue: filterRule,
    ...props,
  });
  const { Button: ButtonView } = useView("components");
  const { FilterGroup } = useView("templates");
  const isValidFlattenRule = isFlattenFilterGroup(filterRule);

  if (!isValidFlattenRule) {
    return (
      <div>
        <div>Invalid Rule</div>
        <ButtonView
          onClick={() => {
            props.onRuleChange?.({
              filterRule: createFlattenFilterGroup(),
              predicate: () => true,
            });
          }}
        >
          Reset Filter
        </ButtonView>
      </div>
    );
  }

  if (totalRuleCount <= 0) {
    return (
      <div>
        <ButtonView
          onClick={() => {
            props.onRuleChange?.({
              filterRule: createFlattenFilterGroup(),
              predicate: () => true,
            });
          }}
        >
          Add Filter
        </ButtonView>
      </div>
    );
  }

  return (
    <FilterSphereProvider context={context} theme={theme}>
      <FilterGroup rule={filterRule} />
    </FilterSphereProvider>
  );
};
FlattenFilterBuilder.displayName = "FlattenFilterBuilder";
