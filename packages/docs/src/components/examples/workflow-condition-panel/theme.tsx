import {
  createFilterTheme,
  useFilterGroup,
  useFilterRule,
  useView,
  type FilterGroup,
  type FilterTheme,
} from "@fn-sphere/filter";
import * as Popover from "@radix-ui/react-popover";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
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

const selectPopoverContentClass =
  "isolate w-52 max-w-[calc(100vw-16px)] rounded-lg border border-slate-200 bg-white p-1 text-slate-900 shadow-lg outline-none";

const selectOptionClass =
  "flex h-8 w-full items-center justify-between rounded-md border-0 bg-white px-2 text-sm font-medium text-slate-700 outline-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-violet-500 data-[highlighted]:bg-slate-100 data-[state=checked]:bg-slate-100 data-[state=checked]:text-slate-950 data-[state=checked]:hover:bg-slate-200";

const BranchIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
    <circle className={iconStroke} cx="6" cy="6" r="2.5" />
    <circle className={iconStroke} cx="18" cy="18" r="2.5" />
    <circle className={iconStroke} cx="6" cy="18" r="2.5" />
    <path className={iconStroke} d="M8.5 6c5 0 7.5 2.5 7.5 9.5" />
    <path className={iconStroke} d="M8.5 18H15" />
  </svg>
);

const ChevronDownIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
    <path className={iconStroke} d="m6 9 6 6 6-6" />
  </svg>
);

const CheckIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
    <path className={iconStroke} d="m5 12 4 4 10-10" />
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
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

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
  "aria-label": ariaLabel,
  className,
  disabled,
  onChange,
  options = [],
  value,
}: PanelSelectProps<T>) => {
  const selectedIdx = options.findIndex((option) => option.value === value);
  const selectedOption = options[selectedIdx];
  const isValueSelect = ariaLabel === undefined;
  const resolvedAriaLabel = ariaLabel ?? "Value";
  const handleValueChange = (nextValue: string) => {
    const selectedOption = options[Number(nextValue)];
    if (selectedOption) {
      onChange?.(selectedOption.value);
    }
  };

  return (
    <div className={cx("min-w-0", className)}>
      <SelectPrimitive.Root
        disabled={!!disabled}
        value={selectedIdx >= 0 ? String(selectedIdx) : ""}
        onValueChange={handleValueChange}
      >
        <SelectPrimitive.Trigger
          aria-label={resolvedAriaLabel}
          className={cx(
            "flex min-h-11 w-full min-w-0 items-center gap-2 border-0 bg-transparent text-left text-[15px] font-medium text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-not-allowed disabled:text-slate-400",
            ariaLabel === "Field" ? "pl-0 pr-2" : "px-3",
          )}
        >
          <span className="min-w-0 flex-1 truncate">
            {selectedOption ? (
              isValueSelect ? (
                <ValueToken>{selectedOption.label}</ValueToken>
              ) : (
                selectedOption.label
              )
            ) : (
              <span className="text-slate-400">Select value</span>
            )}
          </span>
          <SelectPrimitive.Icon asChild>
            <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-500" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            align="start"
            className={selectPopoverContentClass}
            collisionPadding={8}
            position="popper"
            side="bottom"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport>
              {options.map((option, index) => (
                <SelectPrimitive.Item
                  className={selectOptionClass}
                  key={option.label}
                  value={String(index)}
                >
                  <SelectPrimitive.ItemText asChild>
                    <span className="truncate">{option.label}</span>
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator asChild>
                    <CheckIcon className="h-4 w-4 shrink-0 text-slate-600" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
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
  const selectedOptions = options.filter((option) =>
    value.some((currentValue) => currentValue === option.value),
  );

  const handleToggle = (optionValue: T) => {
    const hasValue = value.some((currentValue) => currentValue === optionValue);
    const nextValue = hasValue
      ? value.filter((currentValue) => currentValue !== optionValue)
      : [...value, optionValue];
    onChange?.(nextValue);
  };

  return (
    <div
      className={cx(
        "flex min-h-11 min-w-0 items-center px-3 py-1.5",
        className,
      )}
    >
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            aria-label="Values"
            className="flex min-h-8 min-w-0 flex-1 items-center gap-2 border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={disabled}
            type="button"
          >
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {selectedOptions.length ? (
                selectedOptions.map((option) => (
                  <ValueToken key={option.label}>{option.label}</ValueToken>
                ))
              ) : (
                <span className="text-sm text-slate-400">Select values</span>
              )}
            </span>
            <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-500" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            aria-label="Values"
            className={selectPopoverContentClass}
            collisionPadding={8}
            side="bottom"
            sideOffset={4}
          >
            {options.map((option) => {
              const isSelected = value.some(
                (currentValue) => currentValue === option.value,
              );
              return (
                <button
                  aria-pressed={isSelected}
                  className={selectOptionClass}
                  data-state={isSelected ? "checked" : "unchecked"}
                  key={option.label}
                  type="button"
                  onClick={() => {
                    handleToggle(option.value);
                  }}
                >
                  <span className="truncate">{option.label}</span>
                  <CheckIcon
                    className={cx(
                      "h-4 w-4 text-slate-600",
                      !isSelected && "invisible",
                    )}
                  />
                </button>
              );
            })}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
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

const getRailBottomInset = (group: FilterGroup): number => {
  const lastCondition = group.conditions.at(-1);
  return lastCondition?.type === "FilterGroup" &&
    lastCondition.conditions.length > 1
    ? 12 + getRailBottomInset(lastCondition)
    : 16;
};

const templatesSpec = {
  FilterGroupContainer: ({ children, rule, ...props }) => {
    const {
      ruleState: { isRoot },
      appendChildGroup,
      appendChildRule,
      toggleGroupOp,
    } = useFilterGroup(rule);

    const hasMultipleConditions = rule.conditions.length > 1;
    const groupRail = hasMultipleConditions ? (
      <div
        className="pointer-events-none absolute left-6 top-4 w-4 rounded-l-xl border-y border-l border-slate-200"
        style={{ bottom: getRailBottomInset(rule) }}
      />
    ) : null;
    const groupOperator = hasMultipleConditions ? (
      <button
        className="absolute left-6 top-1/2 inline-flex h-6 -translate-x-1/2 -translate-y-1/2 items-center rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        type="button"
        onClick={() => {
          toggleGroupOp();
        }}
      >
        {rule.op === "and" ? "And" : "Or"}
      </button>
    ) : null;

    if (isRoot) {
      return (
        <div {...props}>
          <div
            className={cx(
              "relative flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50",
              hasMultipleConditions ? "py-3 pl-12 pr-3" : "p-3",
            )}
          >
            {groupRail}
            {groupOperator}
            {children}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <AddButton
              icon={<BranchIcon className="h-4 w-4 text-slate-900" />}
              onClick={() => {
                appendChildRule();
              }}
            >
              Add condition
            </AddButton>
            <AddButton
              icon={<FolderPlusIcon className="h-4 w-4 text-slate-900" />}
              onClick={() => {
                appendChildGroup();
              }}
            >
              Add group
            </AddButton>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cx(
          "group/filter-group relative flex flex-col gap-3 rounded-xl bg-slate-50",
          hasMultipleConditions ? "py-3 pl-12 pr-3" : "p-3",
        )}
        {...props}
      >
        {groupRail}
        {groupOperator}
        {children}
      </div>
    );
  },
  RuleJoiner: () => null,
  SingleFilter: ({ rule }) => {
    const { FieldSelect, FilterDataInput, FilterSelect } = useView("templates");
    const { appendGroup, appendRule, removeRule, selectedField } =
      useFilterRule(rule);

    const fieldName = String(selectedField?.path[0] ?? "");
    const FieldIcon = fieldIcons[fieldName] ?? BranchIcon;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
      <div className="group/filter-rule flex min-w-0 items-start">
        <div className="relative min-w-0 flex-1 rounded-lg border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
          <div className="relative flex min-w-0 border-b border-slate-200">
            <div className="flex min-w-0 flex-1 items-center gap-2 py-0 pl-3 pr-12">
              <FieldIcon className="h-4 w-4 shrink-0 text-slate-500" />
              <FieldSelect
                aria-label="Field"
                className="min-w-0 flex-1"
                rule={rule}
              />
            </div>
            <div className="absolute right-1 top-1">
              <Popover.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <Popover.Trigger asChild>
                  <button
                    aria-label="Condition actions"
                    className={cx(
                      "flex h-9 w-9 items-center justify-center rounded-md border-0 text-lg leading-none opacity-0 transition focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500 group-hover/filter-rule:opacity-100 group-focus-within/filter-rule:opacity-100",
                      isMenuOpen
                        ? "bg-slate-100 text-slate-700 opacity-100"
                        : "bg-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-700",
                    )}
                    type="button"
                  >
                    ⋯
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    align="end"
                    aria-label="Condition actions"
                    className="isolate w-44 rounded-lg border border-slate-200 bg-white p-1 text-slate-900 shadow-lg outline-none"
                    collisionPadding={8}
                    side="bottom"
                    sideOffset={4}
                  >
                    <Popover.Close asChild>
                      <button
                        className="h-8 w-full rounded-md border-0 bg-white px-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                        type="button"
                        onClick={() => {
                          appendRule();
                        }}
                      >
                        Add condition after
                      </button>
                    </Popover.Close>
                    <Popover.Close asChild>
                      <button
                        className="h-8 w-full rounded-md border-0 bg-white px-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                        type="button"
                        onClick={() => {
                          appendGroup();
                        }}
                      >
                        Add group after
                      </button>
                    </Popover.Close>
                    <div className="my-1 h-px bg-slate-200" />
                    <Popover.Close asChild>
                      <button
                        className="h-8 w-full rounded-md border-0 bg-white px-2 text-left text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        type="button"
                        onClick={() => {
                          removeRule(true);
                        }}
                      >
                        Delete condition
                      </button>
                    </Popover.Close>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
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
