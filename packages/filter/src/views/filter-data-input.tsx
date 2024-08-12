import { getParametersExceptFirst, type SingleFilter } from "@fn-sphere/core";
import { useFilterRule } from "../hooks/use-filter-rule.js";
import { useDataInputView, useView } from "../theme/hooks.js";

export type DataInputProps = {
  rule: SingleFilter;
};

export const FilterDataInput = ({ rule }: DataInputProps) => {
  const { Input: InputView } = useView("components");
  const { selectedField, selectedFilter, setRule } = useFilterRule(rule);
  const requiredArguments = selectedFilter
    ? getParametersExceptFirst(selectedFilter)
    : undefined;
  const DataInputView = useDataInputView(
    requiredArguments,
    selectedField?.fieldSchema,
  );

  const setRuleArgs = (value: unknown[]) => {
    // Can not check the schema here because the input value is not always valid
    // For example, z.string().email() will throw an error when user types before the user types the complete email
    // const requiredArgsSchema = z.tuple(requiredArguments);
    // requiredArgsSchema.parse(value);
    setRule({
      ...rule,
      args: value,
    });
  };

  if (!requiredArguments) {
    return <InputView disabled />;
  }

  return (
    <DataInputView
      rule={rule}
      requiredDataSchema={requiredArguments}
      updateInput={setRuleArgs}
    />
  );
};
FilterDataInput.displayName = "FilterDataInput";
