import {
  createFilterTheme,
  defineTypedFn,
  FilterBuilder,
  FilterSphereProvider,
  presetFilter,
  useFilterSphere,
  type DataInputViewSpec,
} from "@fn-sphere/filter";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  id: z.number(),
  name: z.string(),
});

const customFilter = defineTypedFn({
  name: "throw error filter",
  define: z.function({
    input: [z.any(), z.any()],
    output: z.boolean(),
  }),
  implement: () => true,
});

// Define a custom input component
const errorInput: DataInputViewSpec = {
  name: "error",
  match: [z.any()],
  view: () => {
    const [errorTrigger, setErrorTrigger] = useState(false);
    if (errorTrigger) throw new Error("Intentional Error for Demonstration");
    return (
      <button
        className="bg-red-500 text-white px-2 py-1 rounded"
        onClick={() => setErrorTrigger(true)}
      >
        Trigger Error
      </button>
    );
  },
};

const customTheme = createFilterTheme({
  dataInputViews: [errorInput],
});

export function ErrorBoundaryExample() {
  const { context } = useFilterSphere({
    schema,
    filterFnList: [...presetFilter, customFilter],
  });
  return (
    <FilterSphereProvider context={context} theme={customTheme}>
      <FilterBuilder />
    </FilterSphereProvider>
  );
}
