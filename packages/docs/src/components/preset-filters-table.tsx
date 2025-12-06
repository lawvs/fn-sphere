import { defaultGetLocaleText, presetFilter } from "@fn-sphere/filter";
import { z } from "zod";
import type { $ZodTuple } from "zod/v4/core";

interface FilterRow {
  id: string;
  name: string;
  signature: string;
  isGeneric: boolean;
}

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
  const filters: FilterRow[] = presetFilter.map((filter: any) => ({
    id: filter.name,
    name: defaultGetLocaleText(filter.name),
    signature: getFilterSignature(filter),
    isGeneric: isGenericFilter(filter),
  }));

  return (
    <div className="not-content overflow-auto rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
        <thead className="bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Filter Name</th>
            <th className="px-4 py-2">Signature</th>
            <th className="px-4 py-2">Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {filters.map((filter, index) => (
            <tr
              key={index}
              className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800"
            >
              <td className="font-mono px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                {filter.id}
              </td>
              <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">
                {filter.name}
              </td>
              <td className="font-mono px-4 py-2 text-gray-700 dark:text-gray-300">
                {filter.signature}
              </td>
              <td className="px-4 py-2">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    filter.isGeneric
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {filter.isGeneric ? "Generic" : "Typed"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
