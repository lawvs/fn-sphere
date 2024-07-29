import {
  type SingleFilter,
  type StandardFnSchema,
  getParametersExceptFirst,
} from "@fn-sphere/core";
import { useDataInputView, useView } from "../specs/index.js";

type FilterDataInputProps = {
  rule: SingleFilter;
  filterSchema?: StandardFnSchema;
  onChange: (rule: SingleFilter) => void;
};

export const FilterDataInput = ({
  rule,
  filterSchema,
  onChange,
}: FilterDataInputProps) => {
  const Placeholder = useView("DataInputPlaceholder");
  const requiredArguments = filterSchema
    ? getParametersExceptFirst(filterSchema)
    : undefined;
  const DataInputView = useDataInputView(requiredArguments);

  if (!requiredArguments) {
    return <Placeholder />;
  }

  return (
    <DataInputView
      rule={rule}
      requiredDataSchema={requiredArguments}
      onChange={onChange}
    />
  );
};
FilterDataInput.displayName = "FilterDataInput";
