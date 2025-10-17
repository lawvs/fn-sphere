import {
  type IntlMessages,
  type NamespaceKeys,
  type NestedKeyOf,
  useTranslations,
} from "../../mocks";

import { useCallback } from "react";
import { z } from "zod";

const prefixMap: Record<
  `@${string}`,
  "" | NamespaceKeys<IntlMessages, NestedKeyOf<IntlMessages>>
> = {
  // '@root.enums' -> 'enums'
  // '@root' -> ''
  "@root.": "",
  "@root": "",
  "@filter": "components.filter",
};

function mapTranslationKey(input: string) {
  for (const [prefix, replacement] of Object.entries(prefixMap)) {
    if (input.startsWith(prefix)) {
      return replacement + input.slice(prefix.length);
    }
  }
  return input;
}

/**
 * CAUTION: This function is TYPE UNSAFE and should be used with caution.
 */
export function useGetLocaleText<Data>(schema: z.ZodType<Data>) {
  const t = useTranslations();

  const getLocaleText = useCallback(
    (key: string) => {
      if (key.startsWith("@")) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- We need to cast the key to any to avoid type error
        return t(mapTranslationKey(key) as any);
      }

      const scopeKey = schema.description?.startsWith("@")
        ? mapTranslationKey(schema.description)
        : schema.description;
      return t(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- We need to cast the key to any to avoid type error
        (scopeKey ? `${scopeKey}.${key}` : key) as any,
      );
    },
    [schema.description, t],
  );
  return getLocaleText;
}
