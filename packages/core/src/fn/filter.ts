import { z } from "zod";
import type {
  $ZodArray,
  $ZodBoolean,
  $ZodEnum,
  $ZodFunction,
  $ZodLiteral,
  $ZodNumber,
  $ZodString,
  $ZodTypes,
  $ZodUnion,
} from "zod/v4/core";
import { defineGenericFn, defineTypedFn } from "../fn-helpers.js";
import type { GenericFnSchema, StandardFnSchema } from "../types.js";

const unwrapNullish = (schema: $ZodTypes): $ZodTypes => {
  let current = schema;
  while (
    current._zod.def.type === "optional" ||
    current._zod.def.type === "nullable"
  ) {
    current = current._zod.def.innerType as $ZodTypes;
  }
  return current;
};

const asNullish = (schema: $ZodTypes) =>
  z.optional(z.nullable(schema as unknown as z.ZodType));

const isLiteralUnion = (
  schema: $ZodTypes,
): schema is $ZodUnion<$ZodLiteral[]> =>
  schema._zod.def.type === "union" &&
  schema._zod.def.options.every((option) => option._zod.def.type === "literal");

const isNullish = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

const defineNullishGenericFilter = <
  DataType extends $ZodTypes,
  Fn extends $ZodFunction,
>(
  schemaFn: GenericFnSchema<DataType, Fn>,
): GenericFnSchema<$ZodTypes, Fn> =>
  defineGenericFn({
    ...schemaFn,
    genericLimit: (fieldSchema): fieldSchema is $ZodTypes =>
      schemaFn.genericLimit(unwrapNullish(fieldSchema)),
    define: (fieldSchema) =>
      schemaFn.define(unwrapNullish(fieldSchema) as DataType),
  });

export const stringFilter = [
  defineTypedFn({
    name: "startsWith",
    define: z.function({
      input: [z.string().nullish(), z.coerce.string()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      if (typeof value !== "string") return false;
      if (!target) return true;
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
      if (typeof value !== "string") return false;
      if (!target) return true;
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
      if (isNullish(value)) return false;
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
      if (isNullish(value)) return false;
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
      if (isNullish(value)) return false;
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
      if (isNullish(value)) return false;
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
      if (isNullish(value)) return false;
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
      if (isNullish(value)) return false;
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
  defineNullishGenericFilter({
    name: "equals",
    genericLimit: (
      datatype,
    ): datatype is
      $ZodBoolean | $ZodString | $ZodNumber | $ZodUnion<$ZodLiteral[]> =>
      datatype._zod.def.type === "boolean" ||
      datatype._zod.def.type === "string" ||
      datatype._zod.def.type === "number" ||
      isLiteralUnion(datatype),
    define: (datatype) =>
      z.function({
        input: [asNullish(datatype), datatype],
        output: z.boolean(),
      }),
    implement: (value: unknown, target: unknown) => {
      if (isNullish(value)) return false;
      if (typeof value === "string" && typeof target === "string") {
        return value.toLowerCase() === target.toLowerCase();
      }
      return value === target;
    },
  }),
  defineNullishGenericFilter({
    name: "notEqual",
    genericLimit: (
      datatype,
    ): datatype is $ZodString | $ZodNumber | $ZodUnion<$ZodLiteral[]> =>
      // not equal for boolean is not useful
      datatype._zod.def.type === "string" ||
      datatype._zod.def.type === "number" ||
      isLiteralUnion(datatype),
    define: (datatype) =>
      z.function({
        input: [asNullish(datatype), datatype],
        output: z.boolean(),
      }),
    implement: (value: unknown, target: unknown) => {
      if (isNullish(value)) return false;
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
  defineNullishGenericFilter({
    name: "enumEquals",
    genericLimit: (datatype): datatype is $ZodEnum =>
      datatype._zod.def.type === "enum",
    define: (datatype) =>
      z.function({
        input: [asNullish(datatype), datatype],
        output: z.boolean(),
      }),
    implement: (value: unknown, target: unknown) => {
      if (isNullish(value)) return false;
      return value === target;
    },
  }),
  defineNullishGenericFilter({
    name: "enumNotEqual",
    genericLimit: (datatype): datatype is $ZodEnum =>
      datatype._zod.def.type === "enum",
    define: (datatype) =>
      z.function({
        input: [asNullish(datatype), datatype],
        output: z.boolean(),
      }),
    implement: (value: unknown, target: unknown) => {
      if (isNullish(value)) return false;
      return value !== target;
    },
  }),
];

const genericEmptyFilter = [
  defineGenericFn({
    name: "isEmpty",
    genericLimit: (fieldSchema): fieldSchema is $ZodTypes =>
      fieldSchema._zod.def.type === "optional" ||
      fieldSchema._zod.def.type === "nullable" ||
      fieldSchema._zod.def.type === "string",
    define: (fieldSchema) =>
      z.function({
        input: [asNullish(unwrapNullish(fieldSchema))],
        output: z.boolean(),
      }),
    implement: (value: unknown) => {
      return value === null || value === undefined || value === "";
    },
  }),
  defineGenericFn({
    name: "isNotEmpty",
    genericLimit: (fieldSchema): fieldSchema is $ZodTypes =>
      fieldSchema._zod.def.type === "optional" ||
      fieldSchema._zod.def.type === "nullable" ||
      fieldSchema._zod.def.type === "string",
    define: (fieldSchema) =>
      z.function({
        input: [asNullish(unwrapNullish(fieldSchema))],
        output: z.boolean(),
      }),
    implement: (value: unknown) => {
      return !(value === null || value === undefined || value === "");
    },
  }),
];

const genericContainFilter = [
  defineNullishGenericFilter({
    name: "contains",
    genericLimit: (
      datatype,
    ): datatype is
      $ZodString | $ZodArray | $ZodEnum | $ZodUnion<$ZodLiteral[]> =>
      datatype._zod.def.type === "string" ||
      datatype._zod.def.type === "array" ||
      datatype._zod.def.type === "enum" ||
      isLiteralUnion(datatype),
    define: (datatype) => {
      const field = asNullish(datatype);
      if (datatype._zod.def.type === "string") {
        return z.function({
          input: [field, datatype],
          output: z.boolean(),
        });
      }
      if (datatype._zod.def.type === "array") {
        const element = datatype._zod.def.element;
        return z.function({ input: [field, element], output: z.boolean() });
      }
      // union of literals or enum
      return z.function({
        input: [field, z.array(datatype)],
        output: z.boolean(),
      });
    },
    implement: (value: unknown, target: string | unknown | unknown[]) => {
      if (isNullish(value)) return false;
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
  defineNullishGenericFilter({
    name: "notContains",
    genericLimit: (
      datatype,
    ): datatype is
      $ZodString | $ZodArray | $ZodEnum | $ZodUnion<$ZodLiteral[]> =>
      datatype._zod.def.type === "array" ||
      datatype._zod.def.type === "string" ||
      datatype._zod.def.type === "enum" ||
      isLiteralUnion(datatype),
    define: (datatype) => {
      const field = asNullish(datatype);
      if (datatype._zod.def.type === "string") {
        return z.function({
          input: [field, datatype],
          output: z.boolean(),
        });
      }
      if (datatype._zod.def.type === "array") {
        const element = datatype._zod.def.element;
        return z.function({ input: [field, element], output: z.boolean() });
      }
      // union of literals or enum
      return z.function({
        input: [field, z.array(datatype)],
        output: z.boolean(),
      });
    },
    implement: (value: unknown, target: string | unknown | unknown[]) => {
      if (isNullish(value)) return false;
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

export const presetFilter = [...genericFilter, ...commonFilters];
