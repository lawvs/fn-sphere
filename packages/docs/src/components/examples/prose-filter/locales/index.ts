import { defaultGetLocaleText } from "@fn-sphere/filter";
import { messages } from "./messages";
import { mapExpenseFilterName } from "./filter";

export type ProseLocale = keyof typeof messages;

export function getLocaleConfig(locale: ProseLocale) {
  const dictionary = messages[locale];
  return {
    getLocaleText: (key: string) =>
      Object.hasOwn(dictionary, key)
        ? dictionary[key]!
        : defaultGetLocaleText(key),
    mapFilterName: mapExpenseFilterName,
  };
}
