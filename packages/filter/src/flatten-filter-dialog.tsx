import { createFilterPredicate, type LooseFilterGroup } from "@fn-sphere/core";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useState, type ComponentProps } from "react";
import { FilterBuilder } from "./flatten-filter-builder";
import type { FilterBuilderProps, FlattenFilterGroup } from "./types";
import { EMPTY_ROOT_FILTER } from "./utils";

type FilterValue<Data> = {
  rule: LooseFilterGroup;
  predicate: (data: Data) => boolean;
};

type FlattenFilterDialogProps<Data> = ComponentProps<typeof Dialog> & {
  filterBuilder: Omit<FilterBuilderProps<Data>, "filterGroup"> & {
    defaultRule?: FlattenFilterGroup;
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
  const [filterGroup, setFilterGroup] = useState(filterBuilder.defaultRule);
  return (
    <Dialog {...props}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <FilterBuilder
          schema={filterBuilder.schema}
          filterList={filterBuilder.filterList}
          deepLimit={filterBuilder.deepLimit}
          filterGroup={filterGroup}
          onChange={(filterGroup) => {
            onRuleChange?.({
              rule: filterGroup ?? EMPTY_ROOT_FILTER,
              predicate: createFilterPredicate({
                schema: filterBuilder.schema,
                filterList: filterBuilder.filterList,
                rule: filterGroup,
              }),
            });
            setFilterGroup(filterGroup);
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
