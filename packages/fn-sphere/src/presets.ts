import { z } from "zod";
import { defineTypedFn } from "./fn-sphere.js";

export const stringFilter = defineTypedFn([
  {
    define: z.function().args(z.string(), z.string()).returns(z.boolean()),
    name: "Is",
    implement: (value, target) => {
      if (!target) {
        return true;
      }
      return value == target;
    },
  },
  {
    define: z.function().args(z.string(), z.string()).returns(z.boolean()),
    name: "Is not",
    implement: (value, target) => {
      if (!target) {
        return true;
      }
      return value != target;
    },
  },
  {
    define: z.function().args(z.string(), z.string()).returns(z.boolean()),
    name: "Contains",
    implement: (value, target) => {
      if (!target) {
        return true;
      }
      return value.includes(target);
    },
  },
  {
    define: z.function().args(z.string(), z.string()).returns(z.boolean()),
    name: "Does no contains",
    implement: (value, target) => {
      if (!target) {
        return true;
      }
      return !value.includes(target);
    },
  },
  {
    define: z.function().args(z.string(), z.string()).returns(z.boolean()),
    name: "Starts with",
    implement: (value, target) => {
      if (!target) {
        return true;
      }
      return value.startsWith(target);
    },
  },
  {
    define: z.function().args(z.string(), z.string()).returns(z.boolean()),
    name: "Ends with",
    implement: (value, target) => {
      if (!target) {
        return true;
      }
      return value.endsWith(target);
    },
  },
]);

export const numberFilter = defineTypedFn([
  {
    define: z.function().args(z.number(), z.number()).returns(z.boolean()),
    name: ">",
    implement: (value, target) => {
      return value > target;
    },
  },
  {
    define: z.function().args(z.number(), z.number()).returns(z.boolean()),
    name: ">=",
    implement: (value, target) => {
      return value >= target;
    },
  },
  {
    define: z.function().args(z.number(), z.number()).returns(z.boolean()),
    name: "<",
    implement: (value, target) => {
      return value < target;
    },
  },
  {
    define: z.function().args(z.number(), z.number()).returns(z.boolean()),
    name: "<=",
    implement: (value, target) => {
      return value <= target;
    },
  },
  {
    define: z.function().args(z.number(), z.number()).returns(z.boolean()),
    name: "==",
    implement: (value, target) => {
      return value == target;
    },
  },
  {
    define: z.function().args(z.number(), z.number()).returns(z.boolean()),
    name: "!=",
    implement: (value, target) => {
      return value != target;
    },
  },
]);

export const booleanFilter = defineTypedFn([
  {
    define: z.function().args(z.boolean()).returns(z.boolean()),
    name: "Is checked",
    implement: (value) => {
      return !!value;
    },
  },
  {
    define: z.function().args(z.boolean()).returns(z.boolean()),
    name: "Is unchecked",
    implement: (value) => {
      return !value;
    },
  },
]);

export const otherBooleanFilter = defineTypedFn([
  {
    define: z.function().args(z.boolean(), z.boolean()).returns(z.boolean()),
    name: "Is equal",
    implement: (value, target) => {
      return value === target;
    },
  },
]);

export const dateFilter = defineTypedFn([
  {
    define: z.function().args(z.date(), z.date()).returns(z.boolean()),
    name: "Before",
    implement: (value, target) => {
      return value.getTime() < target.getTime();
    },
  },
  {
    define: z.function().args(z.date(), z.date()).returns(z.boolean()),
    name: "After",
    implement: (value, target) => {
      return value.getTime() > target.getTime();
    },
  },
]);

// TODO support case insensitive
// TODO support optional field
export const commonFilters = [
  ...stringFilter,
  ...numberFilter,
  ...booleanFilter,
  ...dateFilter,
];
