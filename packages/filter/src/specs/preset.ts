import { ButtonView, InputView, SelectView } from "../views/components.js";
import { presetDataInputSpecs } from "../views/data-input-views.js";
import { FieldSelect } from "../views/field-select.js";
import { FilterDataInput } from "../views/filter-data-input.js";
import { FilterGroupContainer } from "../views/filter-group-container.js";
import { FilterGroupView } from "../views/filter-group.js";
import { SingleFilterView } from "../views/filter-rule.js";
import { FilterSelect } from "../views/filter-select.js";
import { primitives } from "../views/primitives.js";
import { RuleJoiner } from "../views/rule-joiner.js";
import type { UiSpec } from "./index.js";

export const presetUiSpec: UiSpec = {
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
    FilterDataInput,
    FilterGroupContainer,
  },
  dataInputViews: presetDataInputSpecs,
} satisfies UiSpec;