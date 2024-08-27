import {
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
} from "@fn-sphere/filter";
import { z } from "zod";
import { Table } from "../table";
import { data } from "./utils";

// 1. define the schema for your data
const schema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.date(),
  status: z.union([
    z.literal("pending"),
    z.literal("completed"),
    z.literal("cancelled"),
  ]),
});

export type Data = z.infer<typeof schema>;

export function AdvancedFilter() {
  // 2. use the `useFilterSphere` hook to get the context and predicate
  const { context, predicate } = useFilterSphere({ schema });
  return (
    <>
      <div className="not-content" style={{ marginTop: "1rem" }}>
        {/* 3. display the FilterBuilder inside the FilterSphereProvider */}
        <FilterSphereProvider context={context}>
          <FilterBuilder />
        </FilterSphereProvider>
      </div>
      {/* 4. use the predicate to filter the data */}
      <Table data={data.filter(predicate)} />
    </>
  );
}
