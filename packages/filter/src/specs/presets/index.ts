import { FilterGroup } from "../../filter-group.js";
import { FilterRule } from "../../filter-rule/index.js";
import { presetDataInputSpecs } from "../index.js";
import type { UiSpec } from "../types.js";
import { primitives } from "./primitives.js";
import {
  ButtonView,
  DataInputPlaceholder,
  FilterGroupContainer,
  InputView,
  RuleJoiner,
  SelectView,
} from "./views.js";

export const presetUiSpec: UiSpec = {
  // primitive
  primitives,
  views: {
    Button: ButtonView,
    Input: InputView,
    Select: SelectView,
    FilterRule,
    FilterGroup,
    RuleJoiner,
    // Use when user does not select any field
    DataInputPlaceholder,
    FilterGroupContainer,
  },

  dataInputViews: presetDataInputSpecs,
} satisfies UiSpec;

export { presetDataInputSpecs } from "./data-input-views.js";
