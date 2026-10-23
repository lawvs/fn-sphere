import * as Popover from "@radix-ui/react-popover";
import { useContext, useId, useState, type InputHTMLAttributes } from "react";
import { useRootRule } from "@fn-sphere/filter";
import { ValueLabelContext } from "./value-label-context";
import { formatValue, parseInput } from "./model";

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
  const { getLocaleText: t } = useRootRule();
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
  const { getLocaleText: t } = useRootRule();
  const locale = t("locale");
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
