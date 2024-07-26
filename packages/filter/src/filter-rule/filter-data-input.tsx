import {
  type LooseFilterRule,
  type StandardFnSchema,
  getParametersExceptFirst,
} from "@fn-sphere/core";
import { z } from "zod";
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
  const DataInputView = useDataInputView(
    requiredArguments ?? z.tuple([z.never()]),
  );

  if (!requiredArguments) {
    return <Placeholder />;
  }

  return (
    <DataInputView
      rule={rule}
      inputSchema={requiredArguments}
      onChange={onChange}
    />
  );
};
FilterDataInput.displayName = "FilterDataInput";
