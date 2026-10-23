import * as Popover from "@radix-ui/react-popover";
import * as Select from "@radix-ui/react-select";
import {
  createContext,
  Fragment,
  useContext,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { useProseLocale } from "./locale";
import { formatValue, listSeparator, parseInput } from "./model";

export const ValueLabelContext = createContext("");
type Option<T> = { label: string; value: T };
type InlineSelectProps<T> = {
  options?: Option<T>[] | undefined;
  value?: T | undefined;
  onChange?: ((value: T) => void) | undefined;
  "aria-label"?: string | undefined;
  className?: string | undefined;
  disabled?: boolean | undefined;
  display?: ReactNode;
};

export function InlineSelect<T>({
  options = [],
  value,
  onChange,
  "aria-label": label,
  className = "prose-value",
  disabled,
  display,
}: InlineSelectProps<T>) {
  const { t, locale } = useProseLocale();
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
          {display ?? (index < 0 ? t("chooseValue") : options[index]?.label)}
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

export function InlineMultiple({
  options,
  value,
  negative,
  onChange,
}: {
  options: Option<string>[];
  value: string[];
  negative: boolean;
  onChange: (value: string[]) => void;
}) {
  const { t, locale } = useProseLocale();
  const label = useContext(ValueLabelContext) || t("chooseValue");
  const selected = options.filter((option) => value.includes(option.value));
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="prose-token prose-values"
          aria-label={label}
        >
          {selected.length ? (
            selected.map((option, index) => (
              <Fragment key={option.value}>
                <span className="prose-value-joiner">
                  {listSeparator(index, selected.length, negative, locale)}
                </span>
                <span className="prose-value">{option.label}</span>
              </Fragment>
            ))
          ) : (
            <span className="prose-value">{t("chooseValue")}</span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="prose-popup"
          lang={locale}
          aria-label={label}
          align="start"
          sideOffset={5}
          collisionPadding={12}
        >
          <div className="prose-popup-hint">{t("pickMany")}</div>
          {options.map((option) => (
            <label className="prose-checkbox" key={option.value}>
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...value, option.value]
                    : value.filter((item) => item !== option.value);
                  onChange(
                    options
                      .filter((item) => next.includes(item.value))
                      .map((item) => item.value),
                  );
                }}
              />
              {option.label}
            </label>
          ))}
          <div className="prose-popup-hint">{t("multiHelp")}</div>
          <Popover.Close className="prose-small-button">
            {t("done")}
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

type InlineInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> & { onChange?: (value: string) => void };

function InputDraft({
  value,
  type,
  onCommit,
}: {
  value: string;
  type: string | undefined;
  onCommit: (value: string) => void;
}) {
  const { t } = useProseLocale();
  const label = useContext(ValueLabelContext) || t("chooseValue");
  const id = useId();
  const [draft, setDraft] = useState(value);
  const [attempted, setAttempted] = useState(false);
  const valid = parseInput(draft, type) !== undefined;
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setAttempted(true);
        if (valid) onCommit(draft);
      }}
    >
      <label className="prose-popup-hint" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="prose-draft"
        type={type}
        step={type === "number" ? "any" : undefined}
        value={draft}
        aria-invalid={attempted && !valid}
        aria-describedby={attempted && !valid ? `${id}-error` : undefined}
        onChange={(event) => setDraft(event.target.value)}
      />
      {attempted && !valid && (
        <div id={`${id}-error`} className="prose-input-error">
          {t(type === "number" ? "numberError" : "valueError")}
        </div>
      )}
      <div className="prose-popup-actions">
        <Popover.Close className="prose-small-button" type="button">
          {t("cancel")}
        </Popover.Close>
        <button className="prose-small-button" type="submit">
          {t("apply")}
        </button>
      </div>
    </form>
  );
}

export function InlineInput({
  value,
  type,
  disabled,
  onChange,
}: InlineInputProps) {
  const { t, locale } = useProseLocale();
  const label = useContext(ValueLabelContext) || t("chooseValue");
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="prose-token prose-value"
          disabled={disabled}
          aria-label={label}
        >
          <span className="prose-value">
            {value === undefined || value === ""
              ? t("chooseValue")
              : formatValue(value, locale)}
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="prose-popup"
          lang={locale}
          aria-label={label}
          sideOffset={5}
          collisionPadding={12}
          align="start"
        >
          <InputDraft
            value={String(value ?? "")}
            type={type}
            onCommit={(next) => {
              onChange?.(next);
              setOpen(false);
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
