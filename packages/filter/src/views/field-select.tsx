import type { SingleFilter } from "@fn-sphere/core";
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
  tryRetainArgs,
  tryRetainFilter,
  ...props
}: FieldSelectProps) => {
  const { Select: SelectView } = useView("components");
  const { selectedField, fieldOptions, setField } = useFilterSelect(rule);

  return (
    <SelectView
      value={selectedField}
      options={fieldOptions}
      onChange={(field) =>
        setField(field, {
          tryRetainArgs: !!tryRetainArgs,
          tryRetainFilter: !!tryRetainFilter,
        })
      }
      {...props}
    />
  );
};
FieldSelect.displayName = "FieldSelect";
