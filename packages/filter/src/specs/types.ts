import type { FilterGroup, FilterRule, SingleFilter } from "@fn-sphere/core";
import type {
  ButtonHTMLAttributes,
  ComponentType,
  InputHTMLAttributes,
  ReactNode,
  RefAttributes,
  SelectHTMLAttributes,
} from "react";
import type { z } from "zod";

export type DataInputViewProps = {
  rule: SingleFilter;
  requiredDataSchema: [] | [z.ZodTypeAny, ...z.ZodTypeAny[]];
  onChange: (rule: SingleFilter) => void;
} & RefAttributes<HTMLInputElement>;

export type DataInputViewSpec = {
  name: string;
  match:
    | []
    | [z.ZodTypeAny, ...z.ZodTypeAny[]]
    | ((parameterSchemas: [] | [z.ZodTypeAny, ...z.ZodTypeAny[]]) => boolean);
  view: ComponentType<DataInputViewProps>;
};

/**
 * @internal
 */
export type SelectProps<T> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange" | "children"
> & {
  value?: T;
  options?: { value: T; label: string }[];
  onChange?: (value: T) => void;
};

export type UiSpec = {
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
  views: {
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
    Select: <T>(props: SelectProps<T>) => ReactNode;
    FilterRule: ComponentType<{ rule: SingleFilter }>;
    FilterGroup: ComponentType<{ rule: FilterGroup }>;
    RuleJoiner: ComponentType<{
      parent: FilterGroup;
      joinBetween: [FilterRule, FilterRule];
    }>;
    DataInputPlaceholder: ComponentType<RefAttributes<HTMLInputElement>>;
    FilterGroupContainer: ComponentType<{
      filterGroup: FilterGroup;
      isRoot: boolean;
      children?: ReactNode;
    }>;
  };

  dataInputViews: DataInputViewSpec[];
};
