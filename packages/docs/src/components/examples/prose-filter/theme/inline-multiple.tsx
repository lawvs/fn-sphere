import * as Popover from "@radix-ui/react-popover";
import { Fragment, useState, type SelectHTMLAttributes } from "react";
import { useRootRule } from "@fn-sphere/filter";

type Option<T> = { label: string; value: T };
type InlineMultipleProps<T> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange" | "children" | "multiple"
> & {
  options?: Option<T>[] | undefined;
  value?: T[] | undefined;
  onChange?: (value: T[]) => void;
};

export function InlineMultiple<T>({
  options = [],
  value = [],
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: InlineMultipleProps<T>) {
  const { getLocaleText: t } = useRootRule();
  const locale = t("locale");
  const label = ariaLabel ?? t("chooseValue");
  const selected = options.filter((option) => value.includes(option.value));
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="prose-token prose-values"
          disabled={disabled}
          aria-label={label}
        >
          {selected.length ? (
            selected.map((option, index) => (
              <Fragment key={index}>
                <span className="prose-value-joiner">
                  {t(listSeparatorKey(index, selected.length))}
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
          {options.map((option, index) => (
            <label className="prose-checkbox" key={index}>
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...value, option.value]
                    : value.filter((item) => item !== option.value);
                  onChange?.(
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

function listSeparatorKey(index: number, count: number) {
  if (index === 0) return "";
  if (index !== count - 1) return "list.middle";
  return count > 2 ? "list.serialOr" : "list.or";
}
