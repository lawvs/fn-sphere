import { getParametersExceptFirst, type SingleFilter } from "@fn-sphere/core";
import { forwardRef } from "react";
import { useFilterRule } from "../hooks/use-filter-rule.js";
import { useDataInputView, useView } from "../theme/hooks.js";

export type DataInputProps = {
  rule: SingleFilter;
};

export const FilterDataInput = forwardRef<HTMLInputElement, DataInputProps>(
  ({ rule }, ref) => {
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
      setRule({
        ...rule,
        args: value,
      });
    };

    if (!requiredArguments) {
      return <InputView ref={ref} disabled />;
    }

    return (
      <DataInputView
        ref={ref}
        rule={rule}
        requiredDataSchema={requiredArguments}
        updateInput={setRuleArgs}
      />
    );
  },
);
FilterDataInput.displayName = "FilterDataInput";
