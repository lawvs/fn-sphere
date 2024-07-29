import { createFilterPredicate, type FilterGroup } from "@fn-sphere/core";
import {
  createEmptyFilterGroup,
  FlattenFilterBuilder,
  type BasicFilterProps,
} from "@fn-sphere/filter";
import { useState } from "react";
import { Dialog, type DialogProps } from "tdesign-react";

type FilterValue<Data> = {
  rule: FilterGroup;
  predicate: (data: Data) => boolean;
};

export type FlattenFilterDialogProps<Data> = {
  filterBuilder: BasicFilterProps<Data> & {
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

  return (
    <Dialog
      visible={open}
      header={"Advanced Filter"}
      {...dialogProps}
      onConfirm={() => {
        onConfirm?.({
          rule: filterGroup ?? createEmptyFilterGroup("or"),
          predicate: createFilterPredicate({
            schema: filterBuilder.schema,
            filterList: filterBuilder.filterList,
            rule: filterGroup,
          }),
        });
      }}
    >
      <FlattenFilterBuilder
        schema={filterBuilder.schema}
        filterList={filterBuilder.filterList}
        deepLimit={filterBuilder.deepLimit}
        mapFieldName={filterBuilder.mapFieldName}
        mapFilterName={filterBuilder.mapFilterName}
        rule={controlled ? filterBuilder.rule : filterGroup}
        onChange={(newRule) => {
          onRuleChange?.({
            rule: newRule,
            predicate: createFilterPredicate({
              schema: filterBuilder.schema,
              filterList: filterBuilder.filterList,
              rule: newRule,
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
