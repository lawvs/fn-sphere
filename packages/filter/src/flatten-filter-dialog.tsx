import { createFilterPredicate, type LooseFilterGroup } from "@fn-sphere/core";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { ThemeProvider, type Theme } from "@mui/material/styles";
import { useState, type ComponentProps } from "react";
import { FilterBuilder } from "./flatten-filter-builder";
import type { FilterBuilderProps } from "./types";
import { EMPTY_ROOT_FILTER } from "./utils";

type FlattenFilterDialogProps<Data> = ComponentProps<typeof Dialog> & {
  filterBuilder: FilterBuilderProps<Data>;
  theme?: Partial<Theme>;
  onConfirm?: (value: {
    rule: LooseFilterGroup;
    predicate: (data: Data) => boolean;
  }) => void;
};

export const FlattenFilterDialog = <Data,>({
  filterBuilder,
  theme,
  onConfirm,
  ...props
}: FlattenFilterDialogProps<Data>) => {
  const [filterGroup, setFilterGroup] = useState(filterBuilder.defaultRule);
  return (
    <ThemeProvider theme={{ ...theme }}>
      <Dialog {...props}>
        <DialogTitle>Advanced Filter</DialogTitle>
        <DialogContent>
          <FilterBuilder
            schema={filterBuilder.schema}
            filterList={filterBuilder.filterList}
            deepLimit={filterBuilder.deepLimit}
            defaultRule={filterGroup}
            onChange={(filterGroup) => {
              setFilterGroup(filterGroup);
            }}
          />
        </DialogContent>
        <DialogActions>
          {/*
            <Button onClick={(e) => props.onClose?.(e, "cancel")}>
              Cancel
            </Button>
            */}
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
    </ThemeProvider>
  );
};
FlattenFilterDialog.displayName = "FlattenFilterDialog";
