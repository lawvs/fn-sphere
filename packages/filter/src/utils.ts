import {
  genFilterId,
  type FilterId,
  type LooseFilterGroup,
  type LooseFilterRule,
} from "@fn-sphere/core";
import type { BasicFilterProps, FlattenFilterGroup } from "./types";

export const createEmptyRule = () =>
  ({
    id: genFilterId(),
    type: "Filter",
    arguments: [],
  }) satisfies LooseFilterRule;

export const EMPTY_ROOT_FILTER: LooseFilterGroup = {
  id: genFilterId(),
  type: "FilterGroup",
  op: "or",
  conditions: [
    {
      id: genFilterId(),
      type: "FilterGroup",
      op: "and",
      conditions: [createEmptyRule()],
    },
  ],
} satisfies FlattenFilterGroup;

type Storage<Value> = {
  getItem: (key: string) => Value | Promise<Value>;
  setItem: (key: string, newValue: Value) => void | Promise<void>;
};

/**
 * Ported from https://github.com/pmndrs/jotai/pull/394
 *
 * Licensed under MIT
 */
export const defaultStorage: Storage<LooseFilterGroup> = {
  getItem: (key) => {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
      throw new Error("no value stored");
    }
    // TODO Validating stored values
    return JSON.parse(storedValue);
  },
  setItem: (key, newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue));
  },
};

export const isFlattenFilterGroup = (
  filterGroup: LooseFilterGroup,
): filterGroup is FlattenFilterGroup => {
  if (filterGroup.op === "and") {
    return false;
  }

  return filterGroup.conditions.every(
    (group) =>
      group.type === "FilterGroup" &&
      group.op === "and" &&
      group.conditions.every((rule) => rule.type === "Filter"),
  );
};

export const defaultMapFieldName: NonNullable<
  BasicFilterProps["mapFieldName"]
> = (field) => {
  if (field.fieldSchema.description) {
    return field.fieldSchema.description;
  }
  if (field.path.length) {
    return field.path.join(".");
  }
  return "root";
};

export const defaultMapFilterName: NonNullable<
  BasicFilterProps["mapFilterName"]
> = (filterSchema) => {
  return filterSchema.name;
};

type FilterMap = {
  [key: FilterId]:
    | LooseFilterRule
    | (Omit<LooseFilterGroup, "conditions"> & {
        conditionIds: FilterId[];
      });
};

/**
 * Convert the {@link LooseFilterGroup} to {@link FilterMap}.
 */
export const toFilterMap = (filterGroup: LooseFilterGroup): FilterMap => {
  const map: FilterMap = {};
  const queue: (LooseFilterRule | LooseFilterGroup)[] = [filterGroup];

  while (queue.length) {
    const rule = queue.shift();
    if (!rule) {
      continue;
    }
    if (rule.type === "Filter") {
      // For LooseFilterRule, store it directly
      map[rule.id] = rule;
      continue;
    }

    if (rule.type === "FilterGroup") {
      // For FilterGroup, store with conditionIds instead of direct rule assignment
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { conditions: _, ...rest } = rule;
      map[rule.id] = {
        ...rest,
        conditionIds: rule.conditions.map((condition) => condition.id),
      };
      // Add conditions to the queue for further processing
      queue.push(...rule.conditions);
      continue;
    }
    throw new Error("Invalid rule type");
  }

  return map;
};

const findRootFromMap = (map: FilterMap): FilterId | undefined => {
  const referencedIds = new Set<FilterId>();
  // Collect all IDs that are referenced as children
  Object.values(map).forEach((item) => {
    if (item.type === "FilterGroup" && item.conditionIds) {
      item.conditionIds.forEach((id) => referencedIds.add(id));
    }
  });

  // Find the first key not in the set of referenced IDs
  const rootKey = Object.keys(map).find(
    (key) => !referencedIds.has(key as FilterId),
  ) as FilterId | undefined;
  return rootKey;
};

export const fromFilterMap = (
  map: FilterMap,
  rootKey = findRootFromMap(map),
): LooseFilterGroup => {
  if (!rootKey) {
    throw new Error("No root filter found");
  }
  const root = map[rootKey];
  if (!root) {
    throw new Error("No root filter found");
  }
  if (root.type !== "FilterGroup") {
    throw new Error("Root filter is not a group");
  }
  const result: LooseFilterGroup = {
    id: rootKey,
    type: root.type,
    op: root.op,
    conditions: [],
  };
  result.conditions = root.conditionIds.map((id) => {
    const item = map[id];
    if (!item) {
      throw new Error("Invalid condition ID");
    }
    if (item.type === "Filter") {
      return item;
    }
    if (item.type === "FilterGroup") {
      return fromFilterMap(map, id);
    }
    throw new Error("Invalid item type");
  });
  return result;
};
