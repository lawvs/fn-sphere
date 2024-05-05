import { countNumberOfRules, type LooseFilterGroup } from "@fn-sphere/core";
import { createFilter } from "@fn-sphere/filter";
import { useState } from "react";
import { FilterIcon } from "tdesign-icons-react";
import { Button } from "tdesign-react";
import "./app.css";
import { useZodUI } from "./hooks/misc";
import {
  dataFilters,
  genSampleData,
  presetSchema,
  type PresetData,
} from "./presets";
import { DataTable } from "./table";

const { getRule, openFilter } = createFilter({
  schema: presetSchema,
  filterList: dataFilters,
  deepLimit: Infinity,
});

const initialRule = await getRule();

export const App = () => {
  useZodUI();

  const [tableData] = useState(genSampleData);
  const [flattenFilter, setFlattenFilter] = useState<{
    rule: LooseFilterGroup;
    predicate: (data: PresetData) => boolean;
  }>(initialRule);
  const filteredData = tableData.filter(flattenFilter.predicate);

  return (
    <div className="wrapper">
      <h1>Filter Demo</h1>
      {/* <Column /> */}
      <Button
        icon={<FilterIcon />}
        onClick={async () => {
          // setOpen(!open);
          const value = await openFilter();
          setFlattenFilter(value);
        }}
      >
        Flatten Filter({countNumberOfRules(flattenFilter.rule)})
      </Button>
      <DataTable data={filteredData} />
    </div>
  );
};
