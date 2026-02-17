import type { FilterGroup, SingleFilter } from "@fn-sphere/filter";
import { z } from "zod";
import { filterFnList } from "./schema";

const SQL_OPERATORS: Record<string, string> = {
  equals: "=",
  notEquals: "!=",
  greaterThan: ">",
  greaterThanOrEqual: ">=",
  lessThan: "<",
  lessThanOrEqual: "<=",
  contains: "LIKE",
  notContains: "NOT LIKE",
  startsWith: "LIKE",
  notStartsWith: "NOT LIKE",
  in: "IN",
  notIn: "NOT IN",
  isNull: "IS NULL",
  isNotNull: "IS NOT NULL",
  isEmpty: "= ''",
  isNotEmpty: "!= ''",
  before: "<",
  after: ">",
};

const checkUnaryFilter = (filterName: string) => {
  const filterSchema = filterFnList.find((fn) => fn.name === filterName);
  if (!filterSchema) throw new Error("Unknown filter! " + filterName);
  const filterDefine =
    typeof filterSchema.define === "function"
      ? filterSchema.define(z.any())
      : filterSchema.define;
  const parameters = filterDefine._zod.def.input as z.ZodTuple;
  return parameters._zod.def.items.length <= 1;
};

function escapeSQL(value: string): string {
  return value.replace(/'/g, "''");
}

function transformSingleFilter(filter: SingleFilter): string | null {
  const path = filter.path?.[0];
  const operator = filter.name ? SQL_OPERATORS[filter.name] : undefined;
  const value = filter.args[0];

  if (!filter.name || path === undefined || operator === undefined) {
    return null;
  }
  const isUnaryFilter = checkUnaryFilter(filter.name);
  if (value === undefined && !isUnaryFilter) {
    return null;
  }

  // Handle array values for IN/NOT IN
  if (Array.isArray(value)) {
    const items = value
      .map((v) => (typeof v === "string" ? `'${escapeSQL(v)}'` : v))
      .join(", ");
    return `${path} ${operator} (${items})`;
  }

  // Unary operators (IS NULL, IS NOT NULL, = '', != '')
  if (value === undefined) {
    return `${path} ${operator}`;
  }

  // LIKE patterns for contains/startsWith
  if (typeof value === "string") {
    const escaped = escapeSQL(value);
    if (filter.name === "contains" || filter.name === "notContains") {
      return `${path} ${operator} '%${escaped}%'`;
    }
    if (filter.name === "startsWith" || filter.name === "notStartsWith") {
      return `${path} ${operator} '${escaped}%'`;
    }
    return `${path} ${operator} '${escaped}'`;
  }

  if (value instanceof Date) {
    return `${path} ${operator} '${value.toISOString().split("T")[0]}'`;
  }

  return `${path} ${operator} ${value}`;
}

function transformFilterGroup(filterGroup: FilterGroup): string | null {
  if (!filterGroup.conditions.length) return "";

  const conditions = filterGroup.conditions.map((condition) => {
    if (condition.type === "Filter") {
      return transformSingleFilter(condition);
    } else {
      return transformFilterGroup(condition);
    }
  });

  const operator = filterGroup.op.toUpperCase() as Uppercase<FilterGroup["op"]>;
  const result = conditions.filter((i) => i !== null).join(` ${operator} `);
  if (!result) {
    return null;
  }

  return `(${result})`;
}

/**
 * Transforms a FilterGroup object into a SQL WHERE clause.
 *
 * @example
 * ```ts
 * filterRuleToSQL({
 *   type: "FilterGroup",
 *   op: "and",
 *   conditions: [{
 *     type: "Filter",
 *     path: ["title"],
 *     name: "equals",
 *     args: ["hello world"]
 *   }]
 * })
 * // "WHERE (title = 'hello world')"
 * ```
 */
export const filterRuleToSQL = (filterGroup: FilterGroup) => {
  const where = transformFilterGroup(filterGroup);
  if (!where) return "";
  return `WHERE ${where}`;
};
