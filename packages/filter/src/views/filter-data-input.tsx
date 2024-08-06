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
    const { selectedField, selectedFilter, updateRule } = useFilterRule(rule);
    const requiredArguments = selectedFilter
      ? getParametersExceptFirst(selectedFilter)
      : undefined;
    const DataInputView = useDataInputView(
      requiredArguments,
      selectedField?.fieldSchema,
    );

    const updateInput = (value: unknown[]) => {
      updateRule({
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
        updateInput={updateInput}
      />
    );
  },
);
FilterDataInput.displayName = "FilterDataInput";
