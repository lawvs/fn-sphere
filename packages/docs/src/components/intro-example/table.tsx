import type { Data } from "./code";

export function Table({ data }: { data: Data[] }) {
  return (
    <table
      style={{
        maxHeight: "200px",
      }}
    >
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Status</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>{item.status}</td>
            <td>{item.createdAt.toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
