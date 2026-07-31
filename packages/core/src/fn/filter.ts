import { z } from "zod";
import type {
  $ZodArray,
  $ZodEnum,
  $ZodLiteral,
  $ZodNullable,
  $ZodOptional,
  $ZodString,
  $ZodTypes,
  $ZodUnion,
} from "zod/v4/core";
import { defineGenericFn, defineTypedFn } from "../fn-helpers.js";
import type { FnSchema, GenericFnSchema, StandardFnSchema } from "../types.js";

const unwrapNullishType = (schema: $ZodTypes): $ZodTypes => {
  while (
    schema._zod.def.type === "optional" ||
    schema._zod.def.type === "nullable"
  )
    schema = schema._zod.def.innerType as $ZodTypes;
  return schema;
};

export const stringFilter = [
  defineTypedFn({
    name: "startsWith",
    define: z.function({
      input: [z.string().nullish(), z.coerce.string()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      if (!target) return true;
      if (typeof value !== "string") return false;
      return value.toLowerCase().startsWith(target.toLowerCase());
    },
  }),
  defineTypedFn({
    name: "endsWith",
    define: z.function({
      input: [z.string().nullish(), z.coerce.string()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      if (!target) return true;
      if (typeof value !== "string") return false;
      return value.toLowerCase().endsWith(target.toLowerCase());
    },
  }),
];

export const numberFilter = [
  defineTypedFn({
    name: "greaterThan",
    define: z.function({
      input: [z.number().nullish(), z.coerce.number()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      if (value == null) return false;
      return value > target;
    },
  }),
  defineTypedFn({
    name: "greaterThanOrEqual",
    define: z.function({
      input: [z.number().nullish(), z.coerce.number()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      if (value == null) return false;
      return value >= target;
    },
  }),
  defineTypedFn({
    name: "lessThan",
    define: z.function({
      input: [z.number().nullish(), z.coerce.number()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      if (value == null) return false;
      return value < target;
    },
  }),
  defineTypedFn({
    name: "lessThanOrEqual",
    define: z.function({
      input: [z.number().nullish(), z.coerce.number()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      if (value == null) return false;
      return value <= target;
    },
  }),
];

export const dateFilter = [
  defineTypedFn({
    name: "before",
    define: z.function({
      input: [z.date().nullish(), z.coerce.date()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      if (value == null) return false;
      return value.getTime() < target.getTime();
    },
  }),
  defineTypedFn({
    name: "after",
    define: z.function({
      input: [z.date().nullish(), z.coerce.date()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      if (value == null) return false;
      return value.getTime() > target.getTime();
    },
  }),
];

export const commonFilters: StandardFnSchema[] = [
  ...stringFilter,
  ...numberFilter,
  ...dateFilter,
];

const genericEqualFilter = [
  defineGenericFn({
    name: "equals",
    genericLimit: (t): t is $ZodTypes => {
      const datatype = unwrapNullishType(t);
      return (
        datatype._zod.def.type === "boolean" ||
        datatype._zod.def.type === "string" ||
        datatype._zod.def.type === "number" ||
        (datatype._zod.def.type === "union" &&
          datatype._zod.def.options.every(
            (op) => op._zod.def.type === "literal",
          ))
      );
    },
    define: (t) => {
      const datatype = unwrapNullishType(t);
      return z.function({
        input: [t, datatype],
        output: z.boolean(),
      });
    },
    implement: (value: unknown, target: unknown) => {
      if (typeof value === "string" && typeof target === "string") {
        return value.toLowerCase() === target.toLowerCase();
      }
      return value === target;
    },
  }),
  defineGenericFn({
    name: "notEqual",
    genericLimit: (t): t is $ZodTypes => {
      const datatype = unwrapNullishType(t);
      // not equal for boolean is not useful
      return (
        datatype._zod.def.type === "string" ||
        datatype._zod.def.type === "number" ||
        (datatype._zod.def.type === "union" &&
          datatype._zod.def.options.every(
            (op) => op._zod.def.type === "literal",
          ))
      );
    },
    define: (t) => {
      const datatype = unwrapNullishType(t);
      return z.function({
        input: [t, datatype],
        output: z.boolean(),
      });
    },
    implement: (value: unknown, target: unknown) => {
      if (typeof value === "string" && typeof target === "string") {
        return value.toLowerCase() !== target.toLowerCase();
      }
      return value !== target;
    },
  }),
];

// Enum filters are defined separately from genericEqualFilter because
// z.enum() values are indistinguishable from regular strings at runtime,
export const enumEqualFilter = [
  defineGenericFn({
    name: "enumEquals",
    genericLimit: (t): t is $ZodTypes => {
      const datatype = unwrapNullishType(t);
      return datatype._zod.def.type === "enum";
    },
    define: (t) => {
      const datatype = unwrapNullishType(t);
      return z.function({
        input: [t, datatype],
        output: z.boolean(),
      });
    },
    implement: (value: unknown, target: unknown) => {
      return value === target;
    },
  }),
  defineGenericFn({
    name: "enumNotEqual",
    genericLimit: (t): t is $ZodTypes => {
      const datatype = unwrapNullishType(t);
      return datatype._zod.def.type === "enum";
    },
    define: (t) => {
      const datatype = unwrapNullishType(t);
      return z.function({
        input: [t, datatype],
        output: z.boolean(),
      });
    },
    implement: (value: unknown, target: unknown) => {
      return value !== target;
    },
  }),
];

const genericEmptyFilter = [
  defineGenericFn({
    name: "isEmpty",
    genericLimit: (t): t is $ZodOptional | $ZodNullable | $ZodString =>
      t._zod.def.type === "optional" ||
      t._zod.def.type === "nullable" ||
      t._zod.def.type === "string",
    define: (t) =>
      z.function({
        input: [t],
        output: z.boolean(),
      }),
    implement: (value: unknown | null | undefined | string) => {
      return value === null || value === undefined || value === "";
    },
  }),
  defineGenericFn({
    name: "isNotEmpty",
    genericLimit: (t): t is $ZodOptional | $ZodNullable | $ZodString =>
      t._zod.def.type === "optional" ||
      t._zod.def.type === "nullable" ||
      t._zod.def.type === "string",
    define: (t) =>
      z.function({
        input: [t],
        output: z.boolean(),
      }),
    implement: (value: unknown | null | undefined | string) => {
      return !(value === null || value === undefined || value === "");
    },
  }),
];

const genericContainFilter = [
  defineGenericFn({
    name: "contains",
    genericLimit: (t): t is $ZodTypes => {
      const datatype = unwrapNullishType(t);
      return (
        datatype._zod.def.type === "string" ||
        datatype._zod.def.type === "array" ||
        datatype._zod.def.type === "enum" ||
        (datatype._zod.def.type === "union" &&
          datatype._zod.def.options.every(
            (op) => op._zod.def.type === "literal",
          ))
      );
    },
    define: (t) => {
      const datatype = unwrapNullishType(t);
      if (datatype._zod.def.type === "string") {
        return z.function({
          input: [t, datatype],
          output: z.boolean(),
        });
      }
      if (datatype._zod.def.type === "array") {
        const element = datatype._zod.def.element;
        return z.function({ input: [t, element], output: z.boolean() });
      }
      // union of literals or enum
      return z.function({
        input: [t, z.array(datatype)],
        output: z.boolean(),
      });
    },
    implement: (
      value: z.infer<
        $ZodString | $ZodArray | $ZodEnum | $ZodUnion<$ZodLiteral[]>
      >,
      target: string | unknown | unknown[],
    ) => {
      if (typeof value === "string" && typeof target === "string") {
        // $ZodString
        return value.toLowerCase().includes(target.toLowerCase());
      }
      if (Array.isArray(value)) {
        // $ZodArray
        return value.includes(target);
      }
      if (typeof value === "string" && Array.isArray(target)) {
        // $ZodUnion<$ZodLiteral[]> or $ZodEnum
        return target.includes(value);
      }
      console.error("Invalid input type!");
      return false;
    },
  }),
  defineGenericFn({
    name: "notContains",
    genericLimit: (t): t is $ZodTypes => {
      const datatype = unwrapNullishType(t);
      return (
        datatype._zod.def.type === "array" ||
        datatype._zod.def.type === "string" ||
        datatype._zod.def.type === "enum" ||
        (datatype._zod.def.type === "union" &&
          datatype._zod.def.options.every(
            (op) => op._zod.def.type === "literal",
          ))
      );
    },
    define: (t) => {
      const datatype = unwrapNullishType(t);
      if (datatype._zod.def.type === "string") {
        return z.function({
          input: [t, datatype],
          output: z.boolean(),
        });
      }
      if (datatype._zod.def.type === "array") {
        const element = datatype._zod.def.element;
        return z.function({ input: [t, element], output: z.boolean() });
      }
      // union of literals or enum
      return z.function({
        input: [t, z.array(datatype)],
        output: z.boolean(),
      });
    },
    implement: (
      value: string | unknown[],
      target: string | unknown | unknown[],
    ) => {
      if (typeof value === "string" && typeof target === "string") {
        return !value.toLowerCase().includes(target.toLowerCase());
      }
      if (Array.isArray(value)) {
        return !value.includes(target);
      }
      if (typeof value === "string" && Array.isArray(target)) {
        return !target.includes(value);
      }
      console.error("Invalid input type!");
      return false;
    },
  }),
];

export const genericFilter: GenericFnSchema[] = [
  ...genericEqualFilter,
  ...enumEqualFilter,
  ...genericEmptyFilter,
  ...genericContainFilter,
];

export const presetFilter: FnSchema[] = [
  ...genericEqualFilter,
  ...enumEqualFilter,
  ...genericContainFilter,
  ...commonFilters,
  ...genericEmptyFilter,
];
