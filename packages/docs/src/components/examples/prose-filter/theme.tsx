import { createFilterTheme, type DataInputViewSpec } from "@fn-sphere/filter";
import { useRootRule } from "@fn-sphere/filter";
import type { $ZodArray, $ZodLiteral, $ZodUnion } from "zod/v4/core";
import { InlineInput, InlineMultiple, InlineSelect } from "./inline-editors";
import {
  ProseCondition,
  ProseField,
  ProseGroup,
  ProseOperator,
} from "./prose-rule";

const proseMembershipInput: DataInputViewSpec = {
  name: "prose literal array",
  match: (parameters) => {
    const items = parameters._zod.def.items;
    if (items.length !== 1 || items[0]?._zod.def.type !== "array") return false;
    const array = items[0] as $ZodArray;
    return (
      array._zod.def.element._zod.def.type === "union" &&
      (array._zod.def.element as $ZodUnion)._zod.def.options.every(
        (item) => item._zod.def.type === "literal",
      )
    );
  },
  view: function ProseMembershipInput({
    rule,
    requiredDataSchema,
    updateInput,
  }) {
    const { getLocaleText } = useRootRule();
    const array = requiredDataSchema._zod.def.items[0] as $ZodArray<
      $ZodUnion<$ZodLiteral[]>
    >;
    const options = array._zod.def.element._zod.def.options.map((option) => {
      const value = String(option._zod.def.values[0]);
      return { label: getLocaleText(`value.${value}`), value };
    });
    return (
      <InlineMultiple
        options={options}
        value={(rule.args[0] ?? []) as string[]}
        negative={rule.name === "notContains"}
        onChange={(values) =>
          values.length ? updateInput(values) : updateInput()
        }
      />
    );
  },
};

export const proseTheme = createFilterTheme({
  templates: {
    FilterGroup: ProseGroup,
    SingleFilter: ProseCondition,
    FieldSelect: ProseField,
    FilterSelect: ProseOperator,
  },
  components: { Select: InlineSelect, Input: InlineInput },
  dataInputViews: [proseMembershipInput],
});
