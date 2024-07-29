import {
  type LooseFilterRule,
  type StandardFnSchema,
  getParametersExceptFirst,
} from "@fn-sphere/core";
import { useDataInputView, useView } from "../specs/index.js";

type FilterDataInputProps = {
  rule: LooseFilterRule;
  filterSchema?: StandardFnSchema;
  onChange: (rule: LooseFilterRule) => void;
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
