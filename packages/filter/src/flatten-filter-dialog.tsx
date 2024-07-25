import { createFilterPredicate, type LooseFilterGroup } from "@fn-sphere/core";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  type DialogProps,
} from "@mui/material";
import { useState } from "react";
import { FlattenFilterBuilder } from "./flatten-filter-builder.js";
import type { BasicFilterProps } from "./types.js";
import { createEmptyFilterGroup } from "./utils.js";

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
  dialogProps?: Omit<DialogProps, "open"> & { title?: string };
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
  onConfirm,
  onRuleChange,
}: FlattenFilterDialogProps<Data>) => {
  const controlled = filterBuilder.rule !== undefined;
  // This state will be used only when the dialog is uncontrolled.
  const [filterGroup, setFilterGroup] = useState(filterBuilder.defaultRule);
  return (
    <Dialog open={open} {...dialogProps}>
      <DialogTitle>{dialogProps?.title ?? "Advanced Filter"}</DialogTitle>
      <DialogContent>
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
      </DialogContent>
      <DialogActions>
        {/* <Button onClick={(e) => props.onClose?.(e, "cancel")}>Cancel</Button> */}
        <Button
          onClick={() => {
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
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
FlattenFilterDialog.displayName = "FlattenFilterDialog";
