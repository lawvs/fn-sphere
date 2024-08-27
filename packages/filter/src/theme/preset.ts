import {
  ButtonView,
  InputView,
  MultiSelectView,
  SingleSelectView,
} from "../views/components.js";
import { presetDataInputSpecs } from "../views/data-input-views.js";
import { FieldSelect } from "../views/field-select.js";
import { FilterDataInput } from "../views/filter-data-input.js";
import { FilterGroupContainer } from "../views/filter-group-container.js";
import { FilterGroupView } from "../views/filter-group.js";
import { FilterSelect } from "../views/filter-select.js";
import { primitives } from "../views/primitives.js";
import { RuleJoiner } from "../views/rule-joiner.js";
import { SingleFilterContainer } from "../views/single-filter-container.js";
import { SingleFilterView } from "../views/single-filter.js";
import type { FilterTheme } from "./index.js";

export const presetTheme: FilterTheme = {
  primitives,
  components: {
    Button: ButtonView,
    Input: InputView,
    Select: SingleSelectView,
    MultipleSelect: MultiSelectView,
  },
  templates: {
    SingleFilter: SingleFilterView,
    FilterGroup: FilterGroupView,
    RuleJoiner,
    FieldSelect,
    FilterSelect,
    FilterDataInput,
    FilterGroupContainer,
    SingleFilterContainer,
  },
  dataInputViews: presetDataInputSpecs,
};
