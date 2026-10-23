import * as Select from "@radix-ui/react-select";
import { useContext } from "react";
import { useRootRule } from "@fn-sphere/filter";
import { ValueLabelContext } from "./value-label-context";

type Option<T> = { label: string; value: T };
type InlineSelectProps<T> = {
  options?: Option<T>[] | undefined;
  value?: T | undefined;
  onChange?: ((value: T) => void) | undefined;
  "aria-label"?: string | undefined;
  className?: string | undefined;
  disabled?: boolean | undefined;
};

export function InlineSelect<T>({
  options = [],
  value,
  onChange,
  "aria-label": label,
  className = "prose-value",
  disabled,
}: InlineSelectProps<T>) {
  const { getLocaleText: t } = useRootRule();
  const locale = t("locale");
  const valueLabel = useContext(ValueLabelContext) || t("chooseValue");
  const index = options.findIndex((option) => option.value === value);
  return (
    <Select.Root
      value={index < 0 ? "" : String(index)}
      disabled={!!disabled}
      onValueChange={(next) => {
        const option = options[Number(next)];
        if (option) onChange?.(option.value);
      }}
    >
      <Select.Trigger
        aria-label={label ?? valueLabel}
        className={`prose-token ${className}`}
      >
        <span
          className={className === "prose-value" ? "prose-value" : undefined}
        >
          {index < 0 ? t("chooseValue") : options[index]?.label}
        </span>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="prose-popup"
          lang={locale}
          position="popper"
          sideOffset={5}
          collisionPadding={12}
          align="start"
        >
          <Select.ScrollUpButton className="prose-popup-hint">
            ↑
          </Select.ScrollUpButton>
          <Select.Viewport>
            {options.map((option, optionIndex) => (
              <Select.Item
                className="prose-option"
                key={optionIndex}
                value={String(optionIndex)}
              >
                <Select.ItemIndicator className="prose-check">
                  ✓
                </Select.ItemIndicator>
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="prose-popup-hint">
            ↓
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
