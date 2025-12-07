import { isValidElement, type CSSProperties } from "react";
import type { ZodObject } from "zod";

const renderCell = (value: unknown) => {
  if (isValidElement(value)) {
    return value;
  }
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return JSON.stringify(value);
};

export function Table({
  data,
  schema,
  className,
  style,
}: {
  data: Record<string, unknown>[];
  schema?: ZodObject<any>;
  className?: string;
  style?: CSSProperties;
}) {
  if (!data.length && !schema) {
    return <div>No data</div>;
  }

  const keys = schema ? Object.keys(schema.shape) : Object.keys(data[0] ?? {});

  return (
    <div
      className={`overflow-auto rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 ${
        className ?? ""
      }`}
      style={style}
    >
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
        <thead className="bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          <tr>
            {keys.map((key) => (
              <th key={key} className="px-4 py-2">
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={keys.length}
                className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                No data
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={index}
                className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800"
              >
                {keys.map((key) => (
                  <td
                    key={key}
                    className="px-4 py-2 text-gray-900 dark:text-gray-100"
                  >
                    {renderCell(item[key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
