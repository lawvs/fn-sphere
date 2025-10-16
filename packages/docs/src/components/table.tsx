const stringify = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return JSON.stringify(value);
};

export function Table({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) {
    return <div>No data</div>;
  }

  const keys = Object.keys(data[0] ?? {});

  return (
    <div
      className="overflow-auto rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
      style={{ maxHeight: "250px" }}
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
          {data.map((item, index) => (
            <tr
              key={index}
              className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800"
            >
              {keys.map((key) => (
                <td
                  key={key}
                  className="px-4 py-2 text-gray-900 dark:text-gray-100"
                >
                  {stringify(item[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
