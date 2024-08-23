import {
  createFilterPredicate,
  presetFilter,
  type FilterGroup,
} from "@fn-sphere/core";
import {
  createFilterGroup,
  createSingleFilter,
  type BasicFilterSphereInput,
} from "@fn-sphere/filter";
import { useState } from "react";
import { Dialog, type DialogProps } from "tdesign-react";
import {
  createFlattenFilterGroup,
  FlattenFilterBuilder,
} from "./flatten-filter-builder";

type FilterValue<Data> = {
  rule: FilterGroup;
  predicate: (data: Data) => boolean;
};

export type FlattenFilterDialogProps<Data> = {
  filterBuilder: BasicFilterSphereInput<Data> & {
    rule?: FilterGroup;
    defaultRule?: FilterGroup | undefined;
  };
  open: DialogProps["visible"];
  dialogProps?: Omit<DialogProps, "visible" | "onConfirm">;
  onRuleChange?: (rule: FilterValue<Data>) => void;
  onConfirm?: (value: FilterValue<Data>) => void;
};

/**
 * A dialog to build a filter rule.
 *
 * If `rule` not provided, the dialog will be uncontrolled.
 * The `defaultRule` and `rule` should not be used together.
 *
 * @public
 */
export const FlattenFilterDialog = <Data,>({
  open,
  filterBuilder,
  dialogProps,
  onConfirm,
  onRuleChange,
}: FlattenFilterDialogProps<Data>) => {
  const {
    defaultRule,
    rule: filterBuilderRule,
    ...filterBuilderProps
  } = filterBuilder;
  // This state will be used only when the dialog is uncontrolled.
  const [filterGroup, setFilterGroup] = useState(
    defaultRule ?? createFlattenFilterGroup(),
  );
  const filterFnList = filterBuilder.filterFnList ?? presetFilter;
  const controlled = filterBuilderRule !== undefined;
  const realRule = controlled ? filterBuilderRule : filterGroup;

  return (
    <Dialog
      visible={!!open}
      header={"Advanced Filter"}
      {...dialogProps}
      onConfirm={() => {
        onConfirm?.({
          rule:
            filterGroup ??
            createFilterGroup({
              op: "or",
              conditions: [createSingleFilter()],
            }),
          predicate: createFilterPredicate({
            schema: filterBuilder.schema,
            filterFnList,
            filterRule: filterGroup,
          }),
        });
      }}
    >
      <FlattenFilterBuilder
        filterFnList={filterFnList}
        filterRule={realRule}
        {...filterBuilderProps}
        onRuleChange={({ filterRule, predicate }) => {
          onRuleChange?.({
            rule: filterRule,
            predicate,
          });
          if (!controlled) {
            setFilterGroup(filterRule);
          }
        }}
      />
    </Dialog>
  );
};
FlattenFilterDialog.displayName = "FlattenFilterDialog";
