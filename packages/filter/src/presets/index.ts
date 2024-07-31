import { presetDataInputSpecs } from "../specs/index.js";
import type { UiSpec } from "../specs/types.js";
import { ButtonView, InputView, SelectView } from "../views/components.js";
import { DataInputPlaceholder } from "../views/data-input-placeholder.js";
import { FieldSelect } from "../views/field-select.js";
import { FilterGroupContainer } from "../views/filter-group-container.js";
import { FilterGroupView } from "../views/filter-group.js";
import { SingleFilterView } from "../views/filter-rule/index.js";
import { FilterSelect } from "../views/filter-select.js";
import { primitives } from "../views/primitives.js";
import { RuleJoiner } from "../views/rule-joiner.js";

export const presetUiSpec: UiSpec = {
  // primitive
  primitives,
  components: {
    Button: ButtonView,
    Input: InputView,
    Select: SelectView,
  },
  templates: {
    SingleFilter: SingleFilterView,
    FilterGroup: FilterGroupView,
    RuleJoiner,
    FieldSelect,
    FilterSelect,
    // Use when user does not select any field
    DataInputPlaceholder,
    FilterGroupContainer,
  },
  dataInputViews: presetDataInputSpecs,
} satisfies UiSpec;

export { presetDataInputSpecs } from "./data-input-views.js";
