import type { ZodType } from "zod";
import type {
  FieldFilter,
  FilterGroup,
  FnSchema,
  SerializedGroup,
  SerializedRule,
} from "../types.js";
import { genFilterId, getSchemaAtPath, isGenericFilter } from "../utils.js";
import { createFieldFilter } from "./field.js";
import { createFilterGroup, instantiateGenericFilter } from "./utils.js";

export function serializeFieldRule<T>(rule: FieldFilter<T>): SerializedRule;
export function serializeFieldRule<T>(rule: FilterGroup<T>): SerializedGroup;
export function serializeFieldRule<T>(
  rule: FilterGroup<T> | FieldFilter<T>,
): SerializedGroup | SerializedRule {
  if (rule.type === "Filter") {
    return {
      id: genFilterId(),
      type: "Filter",
      name: rule.schema.name,
      field: rule.field,
      arguments: rule.getPlaceholderArguments(),
    };
  }

  if (rule.type === "FilterGroup") {
    return {
      id: genFilterId(),
      type: "FilterGroup",
      op: rule.op,
      conditions: rule.conditions.map(serializeFieldRule as any),
    };
  }

  throw new Error("Invalid rule!");
}

export function deserializeFieldRule<DataType>(payload: {
  schema: ZodType<DataType>;
  filterList: FnSchema[];
  data: SerializedRule;
}): FieldFilter<DataType>;
export function deserializeFieldRule<DataType>(payload: {
  schema: ZodType<DataType>;
  filterList: FnSchema[];
  data: SerializedGroup;
}): FilterGroup<DataType>;
export function deserializeFieldRule<DataType>({
  schema,
  filterList,
  data,
}: {
  schema: ZodType<DataType>;
  filterList: FnSchema[];
  data: SerializedGroup | SerializedRule;
}): FilterGroup<DataType> | FieldFilter<DataType> {
  if (data.type === "Filter") {
    const fnSchema = filterList.find((f) => f.name === data.name);
    if (!fnSchema) {
      console.error(
        "Failed to deserialize filter rule! Filter not found!",
        data,
      );
      throw new Error(
        `Failed to deserialize filter rule! Filter not found! ${data.name}`,
      );
    }
    const targetSchema = getSchemaAtPath(schema, data.field);
    if (!targetSchema) {
      console.error(
        "Failed to deserialize filter rule! Field not found!",
        data,
      );
      throw new Error("Failed to deserialize filter rule! Field not found!");
    }

    if (isGenericFilter(fnSchema)) {
      const instantiateFnSchema = instantiateGenericFilter(
        targetSchema,
        fnSchema,
      );
      if (!instantiateFnSchema) {
        console.error(
          "Failed to deserialize filter rule! Failed to instantiate generic filter!",
          fnSchema,
          data,
        );
        throw new Error(
          "Failed to deserialize filter rule! Failed to instantiate generic filter!",
        );
      }
      return createFieldFilter(instantiateFnSchema, data.field, data.arguments);
    }
    const result = createFieldFilter<DataType>(
      fnSchema,
      data.field,
      data.arguments,
    );
    return result;
  }

  if (data.type === "FilterGroup") {
    const conditions: (FilterGroup<DataType> | FieldFilter<DataType>)[] =
      data.conditions.map((ruleOrGroup) =>
        deserializeFieldRule({
          schema,
          filterList,
          data: ruleOrGroup as SerializedGroup,
        }),
      );
    return createFilterGroup(data.op, conditions);
  }
  throw new Error("Invalid rule" + data);
}
