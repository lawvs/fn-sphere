import * as Popover from "@radix-ui/react-popover";
import { useId, useState, type InputHTMLAttributes } from "react";
import { useRootRule } from "@fn-sphere/filter";
import { formatValue, parseInput } from "./model";

type InlineInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> & { onChange?: (value: string) => void };

export function InlineInput({
  value,
  type,
  disabled,
  onChange,
}: InlineInputProps) {
  const { getLocaleText: t } = useRootRule();
  const locale = t("locale");
  const label = t("chooseValue");
  const [open, setOpen] = useState(false);
  const id = useId();
  const [draft, setDraft] = useState("");
  const [attempted, setAttempted] = useState(false);
  const valid = parseInput(draft, type) !== undefined;
  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setDraft(String(value ?? ""));
          setAttempted(false);
        }
        setOpen(nextOpen);
      }}
    >
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
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setAttempted(true);
              if (valid) {
                onChange?.(draft);
                setOpen(false);
              }
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
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
