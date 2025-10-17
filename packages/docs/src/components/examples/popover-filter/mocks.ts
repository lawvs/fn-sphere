// This is a temporary file to hold shims for the classic examples
// It is just for demonstration purposes
// Please do not use this code in production

// Shim shadcn UI's cn function
export function cn(...inputs: (string | undefined | false | null)[]): string {
  return inputs.filter(Boolean).join(" ");
}

// Shim next-intl's useTranslations function
export function useTranslations(scope?: string) {
  return (key: string): string => {
    const fullPath = scope ? `${scope}.${key}` : key;
    return (
      (fullPath.split(".").reduce<unknown>((current, segment) => {
        if (current && typeof current === "object" && segment in current) {
          return (current as Record<string, unknown>)[segment];
        }
        return undefined;
      }, mockI18n) as string | undefined) ?? key
    );
  };
}

const mockI18n = {
  components: {
    filter: {
      allFilters: "All Filters",
      apply: "Apply",
      reset: "Reset",
    },
  },
  status: {
    label: "Status",
    PENDING: "Pending",
    COMPLETED: "Completed",
    FAILED: "Failed",
  },
};

type Messages = typeof mockI18n;

export interface IntlMessages extends Messages {}

// Ported form next-intl

type NestedValueOf<
  ObjectType,
  Property extends string,
> = Property extends `${infer Key}.${infer Rest}`
  ? Key extends keyof ObjectType
    ? NestedValueOf<ObjectType[Key], Rest>
    : never
  : Property extends keyof ObjectType
    ? ObjectType[Property]
    : never;

export type NestedKeyOf<ObjectType> = ObjectType extends object
  ? {
      [Key in keyof ObjectType]:
        | `${Key & string}`
        | `${Key & string}.${NestedKeyOf<ObjectType[Key]>}`;
    }[keyof ObjectType]
  : never;

export type NamespaceKeys<ObjectType, Keys extends string> = {
  [Property in Keys]: NestedValueOf<ObjectType, Property> extends string
    ? never
    : Property;
}[Keys];
