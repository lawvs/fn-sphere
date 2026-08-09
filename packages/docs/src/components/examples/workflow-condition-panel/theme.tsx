import {
  createFilterTheme,
  presetTheme,
  useFilterGroup,
  useFilterRule,
  useView,
  type FilterTheme,
} from "@fn-sphere/filter";
import {
  useCallback,
  useState,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type ComponentType,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

type IconProps = {
  className?: string;
};

type SelectOption<T> = {
  label: string;
  value: T;
};

type PanelSelectProps<T> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children" | "multiple" | "onChange" | "value"
> & {
  onChange?: ((value: T) => void) | undefined;
  options?: SelectOption<T>[] | undefined;
  value?: T | undefined;
};

type PanelMultiSelectProps<T> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children" | "multiple" | "onChange" | "value"
> & {
  onChange?: ((value: T[]) => void) | undefined;
  options?: SelectOption<T>[] | undefined;
  value?: T[] | undefined;
};

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const iconStroke =
  "fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]";

const ValueToken = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex min-h-8 items-center rounded-md bg-slate-200 px-2 text-[15px] font-medium leading-none text-slate-900 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)]">
    {children}
  </span>
);

export const BranchIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
    <circle className={iconStroke} cx="6" cy="6" r="2.5" />
    <circle className={iconStroke} cx="18" cy="18" r="2.5" />
    <circle className={iconStroke} cx="6" cy="18" r="2.5" />
    <path className={iconStroke} d="M8.5 6c5 0 7.5 2.5 7.5 9.5" />
    <path className={iconStroke} d="M8.5 18H15" />
  </svg>
);

export const ChevronDownIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
    <path className={iconStroke} d="m6 9 6 6 6-6" />
  </svg>
);

const CloseIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
    <path className={iconStroke} d="M18 6 6 18" />
    <path className={iconStroke} d="m6 6 12 12" />
  </svg>
);

const FolderPlusIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
    <path
      className={iconStroke}
      d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"
    />
    <path className={iconStroke} d="M12 11v5" />
    <path className={iconStroke} d="M9.5 13.5h5" />
  </svg>
);

const GripIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
    <path
      className="fill-current"
      d="M9 7.5a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Zm0 4.5a1.2 1.2 0 1 1-2.4 0A1.2 1.2 0 0 1 9 12Zm0 4.5a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Zm8.4-9a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Zm0 4.5a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Zm0 4.5a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z"
    />
  </svg>
);

const UserIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
    <circle className={iconStroke} cx="12" cy="8" r="3" />
    <path className={iconStroke} d="M5.5 20a6.5 6.5 0 0 1 13 0" />
  </svg>
);

const UsersIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
    <circle className={iconStroke} cx="9" cy="8" r="2.5" />
    <path className={iconStroke} d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path className={iconStroke} d="M16 10.5a2.5 2.5 0 1 0-.4-4.95" />
    <path className={iconStroke} d="M17 14a5.2 5.2 0 0 1 3.5 5" />
  </svg>
);

const fieldIcons: Record<string, ComponentType<IconProps>> = {
  department: UsersIcon,
  position: UserIcon,
  team: UsersIcon,
};

const PanelButton = ({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cx(
      "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:pointer-events-none disabled:opacity-45",
      className,
    )}
    {...props}
  />
);

const PanelInput = ({
  className,
  onChange,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  onChange?: (value: string) => void;
}) => {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event.target.value);
    },
    [onChange],
  );

  return (
    <input
      className={cx(
        "h-10 min-w-0 rounded-none border-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 disabled:cursor-not-allowed disabled:text-slate-400",
        className,
      )}
      onChange={handleChange}
      {...props}
    />
  );
};

const PanelSelect = <T,>({
  className,
  onChange,
  options = [],
  value,
  ...props
}: PanelSelectProps<T>) => {
  const { "aria-label": ariaLabel, ...selectProps } = props;
  const selectedIdx = options.findIndex((option) => option.value === value);
  const selectedOption = options[selectedIdx];
  const isValueSelect = ariaLabel === undefined;
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const index = Number(event.target.value);
      const selectedOption = options[index];
      if (selectedOption) {
        onChange?.(selectedOption.value);
      }
    },
    [onChange, options],
  );

  if (isValueSelect) {
    return (
      <div
        className={cx(
          "relative flex min-h-11 min-w-0 items-center px-3 py-1.5",
          className,
        )}
      >
        {selectedOption ? (
          <ValueToken>{selectedOption.label}</ValueToken>
        ) : (
          <span className="text-sm text-slate-400">Select value</span>
        )}
        <select
          aria-label="Value"
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
          value={selectedIdx}
          onChange={handleChange}
          {...selectProps}
        >
          <option value={-1} disabled></option>
          {options.map(({ label }, index) => (
            <option key={label} value={index}>
              {label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const selectPadding = ariaLabel === "Field" ? "pl-0 pr-8" : "px-3 pr-8";

  return (
    <div className={cx("relative min-w-0", className)}>
      <select
        className={cx(
          "h-11 w-full appearance-none rounded-none border-0 bg-transparent text-[15px] font-medium text-slate-900 outline-none focus:ring-0 disabled:cursor-not-allowed disabled:text-slate-400",
          selectPadding,
        )}
        aria-label={ariaLabel}
        value={selectedIdx}
        onChange={handleChange}
        {...selectProps}
      >
        <option value={-1} disabled></option>
        {options.map(({ label }, index) => (
          <option key={label} value={index}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </div>
  );
};

const PanelMultipleSelect = <T,>({
  className,
  disabled,
  onChange,
  options = [],
  value = [],
}: PanelMultiSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOptions = options.filter((option) =>
    value.some((currentValue) => currentValue === option.value),
  );

  const handleToggleOpen = useCallback(() => {
    if (disabled) {
      return;
    }
    setIsOpen((currentValue) => !currentValue);
  }, [disabled]);

  const handleToggle = useCallback(
    (optionValue: T) => {
      const hasValue = value.some(
        (currentValue) => currentValue === optionValue,
      );
      const nextValue = hasValue
        ? value.filter((currentValue) => currentValue !== optionValue)
        : [...value, optionValue];
      onChange?.(nextValue);
    },
    [onChange, value],
  );

  return (
    <div
      aria-disabled={disabled}
      className={cx(
        "relative flex min-h-11 min-w-0 items-center px-3 py-1.5",
        className,
      )}
    >
      <button
        aria-expanded={isOpen}
        aria-label="Values"
        className="flex min-h-8 min-w-0 flex-1 flex-wrap items-center gap-1.5 border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-45"
        disabled={disabled}
        type="button"
        onClick={handleToggleOpen}
      >
        {selectedOptions.length ? (
          selectedOptions.map((option) => (
            <ValueToken key={option.label}>{option.label}</ValueToken>
          ))
        ) : (
          <span className="text-sm text-slate-400">Select values</span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-2 top-[calc(100%+4px)] z-30 min-w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
          {options.map((option) => {
            const isSelected = value.some(
              (currentValue) => currentValue === option.value,
            );
            return (
              <button
                aria-pressed={isSelected}
                className={cx(
                  "flex h-8 w-full items-center justify-between rounded-md border-0 px-2 text-sm font-medium transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                  isSelected
                    ? "bg-slate-100 text-slate-950"
                    : "bg-transparent text-slate-700",
                )}
                key={option.label}
                type="button"
                onClick={() => {
                  handleToggle(option.value);
                }}
              >
                {option.label}
                {isSelected && <span className="text-slate-500">Selected</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const componentsSpec = {
  Button: PanelButton,
  Input: PanelInput,
  MultipleSelect: PanelMultipleSelect,
  Select: PanelSelect,
} satisfies Partial<FilterTheme["components"]>;

const AddButton = ({
  children,
  icon,
  onClick,
}: {
  children: ReactNode;
  icon: ReactNode;
  onClick: () => void;
}) => (
  <button
    className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[15px] font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
    type="button"
    onClick={onClick}
  >
    {icon}
    {children}
  </button>
);

const templatesSpec = {
  FilterGroupContainer: ({ children, rule, ...props }) => {
    const {
      ruleState: { depth, isRoot },
      appendChildGroup,
      appendChildRule,
      removeGroup,
    } = useFilterGroup(rule);

    const handleAddCondition = useCallback(() => {
      appendChildRule();
    }, [appendChildRule]);

    const handleAddGroup = useCallback(() => {
      appendChildGroup();
    }, [appendChildGroup]);

    const handleRemoveGroup = useCallback(() => {
      removeGroup();
    }, [removeGroup]);

    if (isRoot) {
      return (
        <div {...props}>
          <div className="relative flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 py-3 pl-10 pr-3">
            <div className="pointer-events-none absolute bottom-4 left-4 top-4 w-6 rounded-l-xl border-y border-l border-slate-200" />
            {children}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <AddButton
              icon={<BranchIcon className="h-4 w-4 text-slate-900" />}
              onClick={handleAddCondition}
            >
              Add condition
            </AddButton>
            {depth < 4 && (
              <AddButton
                icon={<FolderPlusIcon className="h-4 w-4 text-slate-900" />}
                onClick={handleAddGroup}
              >
                Add group
              </AddButton>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        className="group/filter-group relative flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 py-3 pl-10 pr-3"
        {...props}
      >
        <div className="pointer-events-none absolute bottom-4 left-4 top-4 w-6 rounded-l-xl border-y border-l border-slate-200" />
        <button
          aria-label="Remove group"
          className="absolute right-0 top-0 hidden h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 group-hover/filter-group:flex"
          type="button"
          onClick={handleRemoveGroup}
        >
          <CloseIcon className="h-4 w-4" />
        </button>
        {children}
      </div>
    );
  },
  FilterSelect: (props) => {
    const PresetFilterSelect = presetTheme.templates.FilterSelect;
    return <PresetFilterSelect tryRetainArgs {...props} />;
  },
  RuleJoiner: ({ parent }) => {
    const { toggleGroupOp } = useFilterGroup(parent);
    const label = parent.op === "and" ? "And" : "Or";
    const handleToggleGroupOp = useCallback(() => {
      toggleGroupOp();
    }, [toggleGroupOp]);

    return (
      <div className="relative h-2">
        <button
          className={cx(
            "absolute z-10 inline-flex h-6 items-center rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
            "left-[-2.35rem] top-1/2 -translate-y-1/2",
          )}
          type="button"
          onClick={handleToggleGroupOp}
        >
          {label}
        </button>
      </div>
    );
  },
  SingleFilter: ({ rule }) => {
    const { FieldSelect, FilterDataInput, FilterSelect } = useView("templates");
    const {
      ruleState: { isValid, parentGroup },
      removeRule,
      selectedField,
    } = useFilterRule(rule);

    const fieldName = String(selectedField?.path[0] ?? "");
    const FieldIcon = fieldIcons[fieldName] ?? BranchIcon;
    const canRemove = parentGroup.conditions.length > 1;

    const handleRemoveRule = useCallback(() => {
      removeRule(true);
    }, [removeRule]);

    return (
      <div
        className={cx(
          "group/filter-rule flex min-w-0 items-start gap-2",
          !isValid && "rounded-lg ring-2 ring-amber-300",
        )}
      >
        <div className="flex h-11 w-5 shrink-0 items-center justify-center pt-2 text-slate-400">
          <GripIcon className="h-4 w-4" />
        </div>
        <div className="relative min-w-0 flex-1 rounded-lg border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
          <div className="relative flex min-w-0 border-b border-slate-200">
            <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
              <FieldIcon className="h-4 w-4 shrink-0 text-slate-500" />
              <FieldSelect
                aria-label="Field"
                className="min-w-0 flex-1"
                rule={rule}
              />
            </div>
            <button
              aria-label="Remove condition"
              className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-md text-slate-400 opacity-0 transition hover:bg-slate-50 hover:text-slate-700 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500 disabled:pointer-events-none disabled:opacity-0 group-hover/filter-rule:opacity-100"
              disabled={!canRemove}
              type="button"
              onClick={handleRemoveRule}
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="grid min-w-0 grid-cols-1 divide-y divide-slate-200 sm:grid-cols-[minmax(110px,0.32fr)_1fr] sm:divide-x sm:divide-y-0">
            <FilterSelect
              aria-label="Condition"
              className="min-w-0"
              rule={rule}
            />
            <FilterDataInput rule={rule} />
          </div>
        </div>
      </div>
    );
  },
} satisfies Partial<FilterTheme["templates"]>;

export const workflowPanelTheme = createFilterTheme({
  components: componentsSpec,
  templates: templatesSpec,
});
