import { useState } from "react";
import "./app.css";
import { Filter } from "./filter";
import { useZodUI } from "./hooks/misc";
import { dataFilters, genSampleData, presetSchema } from "./presets";
import { DataTable } from "./table";

export const App = () => {
  useZodUI();

  const [tableData] = useState(genSampleData);
  const [filter, setFilter] = useState({
    filterData: (d: typeof tableData) => d,
  });
  const restData = filter.filterData(tableData);

  return (
    <div className="wrapper">
      <h1>Filter Demo</h1>
      {/* <Column /> */}
      <Filter
        schema={presetSchema}
        filterList={dataFilters}
        onChange={(data) => {
          setFilter(data);
        }}
      />
      <DataTable data={restData} />
    </div>
  );
};
