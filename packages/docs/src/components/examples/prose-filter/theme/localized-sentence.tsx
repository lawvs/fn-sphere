import { Fragment, type ReactNode } from "react";
import { useRootRule } from "@fn-sphere/filter";

// Rich slots preserve each language's word order without HTML translation strings.
export function LocalizedSentence({
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
