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
    <table
      className="example-table"
      style={{
        maxHeight: "250px",
      }}
    >
      <thead>
        <tr>
          {keys.map((key) => (
            <th key={key}>{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            {keys.map((key) => (
              <td key={key}>{stringify(item[key])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
