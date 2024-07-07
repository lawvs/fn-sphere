import { countNumberOfRules } from "@fn-sphere/core";
import { useAdvancedFilter } from "@fn-sphere/filter";
import { useState } from "react";
import { FilterIcon } from "tdesign-icons-react";
import { Button } from "tdesign-react";
import "./app.css";
import { useZodUI } from "./hooks/misc";
import { dataFilters, genSampleData, presetSchema } from "./presets";
import { DataTable } from "./table";

export const App = () => {
  useZodUI();

  const [tableData] = useState(genSampleData);
  const { rule, predicate, openFilterDialog } = useAdvancedFilter({
    storageKey: "fn-sphere-flatten-filter",
    schema: presetSchema,
    filterList: dataFilters,
    deepLimit: Infinity,
  });

  const filteredData = tableData.filter(predicate);

  return (
    <div className="wrapper">
      <h1>Filter Demo</h1>
      {/* <Column /> */}
      <Button
        icon={<FilterIcon />}
        onClick={async () => {
          // setOpen(!open);
          openFilterDialog();
        }}
      >
        Flatten Filter({countNumberOfRules(rule)})
      </Button>
      <DataTable data={filteredData} />
    </div>
  );
};
