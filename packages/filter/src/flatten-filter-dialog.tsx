import { createFilterPredicate, type LooseFilterGroup } from "@fn-sphere/core";
import Button from "@mui/material/Button";
import Dialog, { type DialogProps } from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";
import { FlattenFilterBuilder } from "./flatten-filter-builder";
import type { BasicFilterProps } from "./types";
import { EMPTY_ROOT_FILTER } from "./utils";

type FilterValue<Data> = {
  rule: LooseFilterGroup;
  predicate: (data: Data) => boolean;
};

export type FlattenFilterDialogProps<Data> = {
  filterBuilder: BasicFilterProps<Data> & {
    rule?: LooseFilterGroup;
    defaultRule?: LooseFilterGroup;
  };
  open: DialogProps["open"];
  dialogProps?: Omit<DialogProps, "open">;
  title?: string;
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
  dialogProps,
  filterBuilder,
  title = "Advanced Filter",
  onConfirm,
  onRuleChange,
}: FlattenFilterDialogProps<Data>) => {
  const controlled = filterBuilder.rule !== undefined;
  // This state will be used only when the dialog is uncontrolled.
  const [filterGroup, setFilterGroup] = useState(filterBuilder.defaultRule);
  return (
    <Dialog open={open} {...dialogProps}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <FlattenFilterBuilder
          schema={filterBuilder.schema}
          filterList={filterBuilder.filterList}
          deepLimit={filterBuilder.deepLimit}
          rule={controlled ? filterBuilder.rule : filterGroup}
          onChange={(newRule) => {
            onRuleChange?.({
              rule: newRule ?? EMPTY_ROOT_FILTER,
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
      </DialogContent>
      <DialogActions>
        {/* <Button onClick={(e) => props.onClose?.(e, "cancel")}>Cancel</Button> */}
        <Button
          onClick={() => {
            onConfirm?.({
              rule: filterGroup ?? EMPTY_ROOT_FILTER,
              predicate: createFilterPredicate({
                schema: filterBuilder.schema,
                filterList: filterBuilder.filterList,
                rule: filterGroup,
              }),
            });
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
FlattenFilterDialog.displayName = "FlattenFilterDialog";
