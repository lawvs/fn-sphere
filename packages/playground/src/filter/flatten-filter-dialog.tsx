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
import { FlattenFilterBuilder } from "./flatten-filter-builder";

type FilterValue<Data> = {
  rule: FilterGroup;
  predicate: (data: Data) => boolean;
};

export type FlattenFilterDialogProps<Data> = {
  filterBuilder: BasicFilterSphereInput<Data> & {
    rule?: FilterGroup;
    defaultRule?: FilterGroup;
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
  const controlled = filterBuilder.rule !== undefined;
  // This state will be used only when the dialog is uncontrolled.
  const [filterGroup, setFilterGroup] = useState(filterBuilder.defaultRule);
  const filterFnList = filterBuilder.filterFnList ?? presetFilter;
  const realRule = controlled ? filterBuilder.rule : filterGroup;

  return (
    <Dialog
      visible={open}
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
        schema={filterBuilder.schema}
        filterFnList={filterFnList}
        fieldDeepLimit={filterBuilder.fieldDeepLimit}
        mapFieldName={filterBuilder.mapFieldName}
        mapFilterName={filterBuilder.mapFilterName}
        filterRule={realRule}
        onRuleChange={(newRule) => {
          onRuleChange?.({
            rule: newRule,
            predicate: createFilterPredicate({
              schema: filterBuilder.schema,
              filterFnList,
              filterRule: newRule,
            }),
          });
          if (!controlled) {
            setFilterGroup(newRule);
          }
        }}
      />
    </Dialog>
  );
};
FlattenFilterDialog.displayName = "FlattenFilterDialog";
