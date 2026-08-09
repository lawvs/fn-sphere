import {
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
} from "@fn-sphere/filter";
import {
  createWorkflowDefaultRule,
  workflowFilterLabels,
  workflowFilterList,
  workflowSchema,
} from "./schema";
import { workflowPanelTheme } from "./theme";

export function WorkflowConditionPanel() {
  const { context } = useFilterSphere({
    defaultRule: createWorkflowDefaultRule,
    filterFnList: workflowFilterList,
    getLocaleText: (key) => key,
    mapFilterName: (filter) => workflowFilterLabels[filter.name] ?? filter.name,
    schema: workflowSchema,
  });

  return (
    <FilterSphereProvider context={context} theme={workflowPanelTheme}>
      <FilterBuilder />
    </FilterSphereProvider>
  );
}
