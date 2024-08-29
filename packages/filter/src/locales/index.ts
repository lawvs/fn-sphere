import { LOCALE_EN } from "./en-US.js";

export { LOCALE_EN } from "./en-US.js";
export { LOCALE_CN } from "./zh-CN.js";

export const defaultGetLocaleText = (key: string): string => {
  if (!(key in LOCALE_EN)) {
    // console.warn(`Key "${key}" not found in locale`);
    return key;
  }
  return LOCALE_EN[key as keyof typeof LOCALE_EN];
};
