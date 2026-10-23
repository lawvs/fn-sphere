import { Fragment, type ReactNode } from "react";
import { useRootRule } from "@fn-sphere/filter";

export function formatText(text: string, values: Record<string, string>) {
  return text.replace(
    /\{(\w+)\}/g,
    (placeholder, name: string) => values[name] ?? placeholder,
  );
}

// Rich slots preserve each language's word order without HTML translation strings.
export function ProseText({
  message,
  slots,
}: {
  message: string;
  slots: Record<string, ReactNode>;
}) {
  const { getLocaleText } = useRootRule();
  return (
    <>
      {getLocaleText(message)
        .split(/(\{\w+\})/g)
        .map((part, index) => (
          <Fragment key={index}>
            {part.startsWith("{") ? (slots[part.slice(1, -1)] ?? part) : part}
          </Fragment>
        ))}
    </>
  );
}
