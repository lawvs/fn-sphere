import { createFilterTheme } from "@fn-sphere/filter";
import { InlineInput, InlineMultiple, InlineSelect } from "./inline-editors";
import {
  ProseCondition,
  ProseField,
  ProseGroup,
  ProseOperator,
} from "./prose-rule";

import "./prose-filter.css";

export const proseTheme = createFilterTheme({
  templates: {
    FilterGroup: ProseGroup,
    SingleFilter: ProseCondition,
    FieldSelect: ProseField,
    FilterSelect: ProseOperator,
  },
  components: {
    Select: InlineSelect,
    MultipleSelect: InlineMultiple,
    Input: InlineInput,
  },
});
