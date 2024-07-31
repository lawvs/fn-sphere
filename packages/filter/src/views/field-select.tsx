import type { SingleFilter } from "@fn-sphere/core";
import { useFilterSelect } from "../hooks/use-filter-select.js";
import { useView } from "../specs/index.js";

export type FieldSelectProps = {
  rule: SingleFilter;
};

export const FieldSelect = ({ rule }: FieldSelectProps) => {
  const { Select: SelectView } = useView("components");
  const { selectedField, fieldOptions, updateField } = useFilterSelect(rule);

  return (
    <SelectView
      value={selectedField}
      options={fieldOptions}
      onChange={updateField}
    />
  );
};
FieldSelect.displayName = "FieldSelect";
