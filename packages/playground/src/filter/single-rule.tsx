import {
  isEqualPath,
  type FilterGroup,
  type FilterRuleWrapper,
  type FilterableField,
} from "@fn-sphere/core";
import { List } from "@zodui/react";
import { CloseIcon } from "tdesign-icons-react";
import { Button, Select } from "tdesign-react";
import { useFilter, useFilterableField } from "../hooks/filter";

export const SingleRule = ({
  rule,
  ruleParent,
}: {
  rule: FilterRuleWrapper;
  ruleParent: FilterGroup;
}) => {
  const { updateFilter, inputFilter, removeFilter } = useFilter();
  const fields = useFilterableField(Infinity);

  // Patch for the zodui
  const firstParam = rule.requiredParameters.items.at(0);
  if (firstParam) {
    if (firstParam._def.typeName === "ZodNumber") {
      // See https://zodui.github.io/zodui/docs/guide/basic/types#%E6%95%B0%E5%AD%97
      firstParam._def.mode = "slider";
    }
    if (firstParam._def.typeName === "ZodDate") {
      // See https://zodui.github.io/zodui/docs/guide/basic/types#%E6%97%A5%E6%9C%9F
      firstParam._def.mode = "date";
    }
  }

  return (
    <>
      <Select
        value={
          fields.find((field) => isEqualPath(field.path, rule.path))
            ?.fieldSchema.description
        }
        options={[
          ...fields.map((field, i) => ({
            label:
              field.fieldSchema.description ||
              field.path.join(".") ||
              `Unknown ${i}`,
            value: field,
          })),
        ]}
        onChange={(v) => {
          const field = v as FilterableField;
          updateFilter(rule, field.filterList[0], ruleParent);
        }}
      ></Select>
      <Select
        value={rule.schema.name}
        options={
          fields
            .find((field) => isEqualPath(field.path, rule.path))
            ?.filterList.map((filter) => ({
              label: filter.name,
              value: filter,
            })) ?? []
        }
        onChange={(v) => {
          const filter = v as FilterRuleWrapper;
          updateFilter(rule, filter, ruleParent);
        }}
      ></Select>
      {firstParam && (
        <List
          key={rule.schema.name + rule.path}
          className="rule-input"
          model={rule.requiredParameters}
          value={rule.getPlaceholderArguments() as any}
          onChange={(v) => {
            inputFilter(rule, v);
          }}
        ></List>
      )}
      <Button
        shape="round"
        theme="danger"
        variant="text"
        icon={<CloseIcon size={50}></CloseIcon>}
        onClick={() => {
          removeFilter(rule, ruleParent);
        }}
      />
    </>
  );
};
