import type { SingleFilter } from "@fn-sphere/core";
import type {
  ButtonHTMLAttributes,
  ComponentType,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import type { $ZodTuple, $ZodType } from "zod/v4/core";
import type {
  MultiSelectProps,
  SingleSelectProps,
} from "../views/components.js";
import type { FieldSelectProps } from "../views/field-select.js";
import type { DataInputProps } from "../views/filter-data-input.js";
import type { FilterGroupContainerProps } from "../views/filter-group-container.js";
import type { FilterGroupProps } from "../views/filter-group.js";
import type { FilterSelectProps } from "../views/filter-select.js";
import type { RuleJoinerProps } from "../views/rule-joiner.js";
import type { SingleFilterContainerProps } from "../views/single-filter-container.js";
import type { SingleFilterRuleProps } from "../views/single-filter.js";

export type DataInputViewProps = {
  rule: SingleFilter;
  requiredDataSchema: $ZodTuple;
  updateInput: (...input: unknown[]) => void;
};

export type DataInputViewSpec = {
  name: string;
  match:
    | []
    | [$ZodType, ...$ZodType[]]
    | $ZodTuple
    | ((
        // The first parameter is the fn schema required parameters except the first one
        parameterSchemas: $ZodTuple,
        // The second parameter is the field schema, in most cases, you don't need to use it
        fieldSchema?: $ZodType,
      ) => boolean);
  view: ComponentType<DataInputViewProps>;
  meta?: Record<string, unknown>;
};

export type FilterTheme = {
  primitives: {
    button: ComponentType<ButtonHTMLAttributes<HTMLButtonElement>>;
    input: ComponentType<InputHTMLAttributes<HTMLInputElement>>;
    select: ComponentType<InputHTMLAttributes<HTMLSelectElement>>;
    option: ComponentType<InputHTMLAttributes<HTMLOptionElement>>;
  };
  components: {
    Button: ComponentType<ButtonHTMLAttributes<HTMLButtonElement>>;
    Input: ComponentType<
      Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
        onChange?: (value: string) => void;
      }
    >;
    // Select: ComponentType<SelectProps<unknown> & RefAttributes<HTMLElement>>;
    Select: <T>(props: SingleSelectProps<T>) => ReactNode;
    MultipleSelect: <T>(props: MultiSelectProps<T>) => ReactNode;
  };
  templates: {
    FilterGroupContainer: ComponentType<FilterGroupContainerProps>;
    SingleFilterContainer: ComponentType<SingleFilterContainerProps>;
    RuleJoiner: ComponentType<RuleJoinerProps>;
    FieldSelect: ComponentType<FieldSelectProps>;
    FilterSelect: ComponentType<FilterSelectProps>;
    FilterDataInput: ComponentType<DataInputProps>;
    SingleFilter: ComponentType<SingleFilterRuleProps>;
    FilterGroup: ComponentType<FilterGroupProps>;
  };
  dataInputViews: DataInputViewSpec[];
};

/**
 * @deprecated use {@link FilterTheme} instead
 */
export type ThemeSpec = FilterTheme;
