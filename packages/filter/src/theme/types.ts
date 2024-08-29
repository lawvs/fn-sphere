import type { SingleFilter } from "@fn-sphere/core";
import type {
  ButtonHTMLAttributes,
  ComponentType,
  InputHTMLAttributes,
  ReactNode,
  Ref,
  RefAttributes,
} from "react";
import type { z } from "zod";
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
  requiredDataSchema: [] | [z.ZodTypeAny, ...z.ZodTypeAny[]];
  updateInput: (...input: unknown[]) => void;
};

export type DataInputViewSpec = {
  name: string;
  match:
    | []
    | [z.ZodTypeAny, ...z.ZodTypeAny[]]
    | ((
        parameterSchemas: [] | [z.ZodTypeAny, ...z.ZodTypeAny[]],
        fieldSchema?: z.ZodTypeAny,
      ) => boolean);
  view: ComponentType<DataInputViewProps>;
  meta?: Record<string, unknown>;
};

export type FilterTheme = {
  primitives: {
    button: ComponentType<
      ButtonHTMLAttributes<HTMLButtonElement> & RefAttributes<HTMLButtonElement>
    >;
    input: ComponentType<
      InputHTMLAttributes<HTMLInputElement> & RefAttributes<HTMLInputElement>
    >;
    select: ComponentType<
      InputHTMLAttributes<HTMLSelectElement> & RefAttributes<HTMLSelectElement>
    >;
    option: ComponentType<
      InputHTMLAttributes<HTMLOptionElement> & RefAttributes<HTMLOptionElement>
    >;
  };
  components: {
    Button: ComponentType<
      ButtonHTMLAttributes<HTMLButtonElement> & RefAttributes<HTMLButtonElement>
    >;
    Input: ComponentType<
      Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> &
        RefAttributes<HTMLInputElement> & {
          onChange?: (value: string) => void;
        }
    >;
    // Select: ComponentType<SelectProps<unknown> & RefAttributes<HTMLElement>>;
    Select: <T>(
      props: SingleSelectProps<T> & { ref?: Ref<HTMLSelectElement> },
    ) => ReactNode;
    MultipleSelect: <T>(
      props: MultiSelectProps<T> & { ref?: Ref<HTMLSelectElement> },
    ) => ReactNode;
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
