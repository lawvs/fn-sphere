import { createFilterPredicate, type LooseFilterGroup } from "@fn-sphere/core";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useState, type ComponentProps } from "react";
import { FlattenFilterBuilder } from "./flatten-filter-builder";
import type { FilterBuilderProps } from "./types";
import { EMPTY_ROOT_FILTER } from "./utils";

type FilterValue<Data> = {
  rule: LooseFilterGroup;
  predicate: (data: Data) => boolean;
};

type FlattenFilterDialogProps<Data> = ComponentProps<typeof Dialog> & {
  filterBuilder: FilterBuilderProps<Data> & {
    defaultRule?: LooseFilterGroup;
  };
  title?: string;
  onRuleChange?: (rule: FilterValue<Data>) => void;
  onConfirm?: (value: FilterValue<Data>) => void;
};

export const FlattenFilterDialog = <Data,>({
  title = "Advanced Filter",
  filterBuilder,
  onConfirm,
  onRuleChange,
  ...props
}: FlattenFilterDialogProps<Data>) => {
  const controlled = filterBuilder.rule !== undefined;
  const [filterGroup, setFilterGroup] = useState(filterBuilder.defaultRule);
  return (
    <Dialog {...props}>
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
