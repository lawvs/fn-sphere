import type { LooseFilterGroup, LooseFilterRule } from "@fn-sphere/core";
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
  rule: LooseFilterRule;
  requiredDataSchema: [] | [z.ZodTypeAny, ...z.ZodTypeAny[]];
  onChange: (rule: LooseFilterRule) => void;
} & RefAttributes<HTMLInputElement>;

export type DataInputViewSpec = {
  name: string;
  match:
    | []
    | [z.ZodTypeAny, ...z.ZodTypeAny[]]
    | ((parameterSchemas: [] | [z.ZodTypeAny, ...z.ZodTypeAny[]]) => boolean);
  view: ComponentType<DataInputViewProps>;
};

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
    FilterRule: ComponentType<{ rule: LooseFilterRule }>;
    FilterGroup: ComponentType<{ rule: LooseFilterGroup }>;
    RuleJoiner: ComponentType<{
      parent: LooseFilterGroup;
      joinBetween: [
        LooseFilterRule | LooseFilterGroup,
        LooseFilterRule | LooseFilterGroup,
      ];
    }>;
    DataInputPlaceholder: ComponentType<RefAttributes<HTMLInputElement>>;
    FilterGroupContainer: ComponentType<{
      filterGroup: LooseFilterGroup;
      isRoot: boolean;
      children?: ReactNode;
    }>;
  };

  dataInputViews: DataInputViewSpec[];
};
