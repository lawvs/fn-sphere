import { enUS } from "./en-US.js";

export const defaultGetLocaleText = (key: string): string => {
  if (!(key in enUS)) {
    // console.warn(`Key "${key}" not found in locale`);
    return key;
  }
  return enUS[key as keyof typeof enUS];
};
