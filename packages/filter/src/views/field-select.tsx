import type { SingleFilter } from "@fn-sphere/core";
import {
  useFilterSelect,
  type UpdateFieldOptions,
} from "../hooks/use-filter-select.js";
import { useView } from "../theme/index.js";

export type FieldSelectProps = {
  rule: SingleFilter;
} & UpdateFieldOptions;

export const FieldSelect = ({
  rule,
  ...updateFieldOptions
}: FieldSelectProps) => {
  const { Select: SelectView } = useView("components");
  const { selectedField, fieldOptions, setField } = useFilterSelect(rule);

  return (
    <SelectView
      value={selectedField}
      options={fieldOptions}
      onChange={(field) => setField(field, updateFieldOptions)}
    />
  );
};
FieldSelect.displayName = "FieldSelect";
