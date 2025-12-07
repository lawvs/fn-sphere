import { defaultGetLocaleText, presetFilter } from "@fn-sphere/filter";
import { z } from "zod";
import type { $ZodTuple } from "zod/v4/core";
import { Table } from "./table";

// A unique symbol to represent generic type parameters
const T = z.symbol();

function getFilterSignature(filter: (typeof presetFilter)[number]): string {
  let defineSchema = filter.define;

  // For generic functions, instantiate with a symbol to get the signature
  if (typeof defineSchema === "function") {
    const instantiated = defineSchema(T);
    defineSchema = instantiated;
  }

  // Extract input and output types
  const inputs = (defineSchema._zod.def.input as $ZodTuple)._zod.def.items;
  const inputTypes = inputs
    .map((input) => {
      if (input === T) {
        // Use 'T' for symbol types to indicate generics
        return "T";
      }
      const typeName = input._zod.def?.type || "unknown";
      return typeName;
    })
    .join(", ");

  const output = defineSchema._zod.def.output;
  const outputType = output === T ? "T" : output._zod.def.type;

  return `(${inputTypes}) => ${outputType}`;
}

function isGenericFilter(filter: (typeof presetFilter)[number]): boolean {
  return typeof filter.define === "function";
}

export function PresetFiltersTable() {
  const filters = presetFilter.map((filter) => {
    const isGeneric = isGenericFilter(filter);
    return {
      ID: (
        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
          {filter.name}
        </span>
      ),
      "Filter Name": (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {defaultGetLocaleText(filter.name)}
        </span>
      ),
      Signature: (
        <span className="font-mono text-gray-700 dark:text-gray-300">
          {getFilterSignature(filter)}
        </span>
      ),
      Type: (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            isGeneric
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          }`}
        >
          {isGeneric ? "Generic" : "Typed"}
        </span>
      ),
    };
  });

  return <Table data={filters} className="not-content" />;
}
