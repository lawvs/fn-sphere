import type { FilterField, SingleFilter } from "@fn-sphere/core";
import { useCallback } from "react";
import {
  useFilterSelect,
  type UpdateFieldOptions,
} from "../hooks/use-filter-select.js";
import { useView } from "../theme/index.js";
import type { CommonProps } from "./types.js";

export type FieldSelectProps = {
  rule: SingleFilter;
} & UpdateFieldOptions &
  CommonProps;

export const FieldSelect = ({
  rule,
  tryRetainArgs = true,
  tryRetainFilter = true,
  ...props
}: FieldSelectProps) => {
  const { Select: SelectView } = useView("components");
  const { selectedField, fieldOptions, setField } = useFilterSelect(rule);

  const handleChange = useCallback(
    (field: FilterField) =>
      setField(field, {
        tryRetainArgs: !!tryRetainArgs,
        tryRetainFilter: !!tryRetainFilter,
      }),
    [setField, tryRetainArgs, tryRetainFilter],
  );

  return (
    <SelectView
      value={selectedField}
      options={fieldOptions}
      onChange={handleChange}
      {...props}
    />
  );
};
FieldSelect.displayName = "FieldSelect";
