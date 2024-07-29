import type {
  FilterGroup,
  FilterId,
  FilterRule,
  SingleFilter,
} from "@fn-sphere/core";

type RuleNode =
  | {
      type: "Filter";
      data: SingleFilter;
      parentId: FilterId;
    }
  | (Omit<FilterGroup, "conditions"> & {
      // The root filter group's parent ID is itself
      parentId: FilterId;
      conditionIds: FilterId[];
    });

/**
 * Flatten the filter group to a map for easier manipulation.
 *
 * @internal
 */
export type FilterMap = {
  // [key: FilterId]:
  [key: string]: RuleNode | undefined;
};

const isRoot = (node: RuleNode) => {
  const id = node.type === "Filter" ? node.data.id : node.id;
  return id === node.parentId;
};

const findRootFromMap = (map: FilterMap): FilterId => {
  const rootRule = Object.values(map).find((value) => value && isRoot(value));
  if (!rootRule) {
    throw new Error("No root filter found");
  }
  if (rootRule.type !== "FilterGroup") {
    throw new Error("Root filter is not a group");
  }
  return rootRule.id;
};

/**
 * Convert the {@link FilterGroup} to {@link FilterMap}.
 */
export const toFilterMap = (
  rootFilterGroup: FilterGroup,
  parentId?: FilterId,
): FilterMap => {
  const map: FilterMap = {};
  const parentMap: Record<FilterId, FilterId> = {
    [rootFilterGroup.id]: parentId ?? rootFilterGroup.id,
  };
  const queue: FilterRule[] = [rootFilterGroup];

  while (queue.length) {
    const rule = queue.shift();
    if (!rule) {
      continue;
    }
    if (rule.type === "Filter") {
      const parentId = parentMap[rule.id];
      if (!parentId) {
        throw new Error("Invalid parent ID! Filter must have a parent");
      }
      map[rule.id] = {
        type: "Filter",
        data: rule,
        parentId,
      };
      continue;
    }

    if (rule.type === "FilterGroup") {
      // For FilterGroup, store with conditionIds instead of direct rule assignment
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { conditions: _, ...rest } = rule;
      map[rule.id] = {
        ...rest,
        conditionIds: rule.conditions.map((condition) => condition.id),
        parentId: parentMap[rule.id],
      };
      // Add conditions to the queue for further processing
      queue.push(...rule.conditions);
      // Update parent map for the conditions
      rule.conditions.forEach((condition) => {
        parentMap[condition.id] = rule.id;
      });
      continue;
    }
    throw new Error("Invalid rule type");
  }

  return map;
};

export const fromFilterMap = (
  map: FilterMap,
  rootKey = findRootFromMap(map),
): FilterGroup => {
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
  const result: FilterGroup = {
    id: rootKey,
    type: root.type,
    op: root.op,
    conditions: [],
  };
  result.conditions = root.conditionIds.map((id) => {
    const item = map[id];
    if (!item) {
      console.error("Invalid condition ID", id, map, rootKey);
      throw new Error("Invalid condition ID");
    }
    if (item.type === "Filter") {
      return item.data;
    }
    if (item.type === "FilterGroup") {
      return fromFilterMap(map, id);
    }
    throw new Error("Invalid item type");
  });
  return result;
};

/**
 * Calculates the depth of a given filter rule within the filterMap structure.
 * The root filter has a depth of 0. Each step towards a child filter increases the depth by 1.
 */
export const getDepthOfRule = (filterMap: FilterMap, id: FilterId): number => {
  const maybeRuleNode = filterMap[id];
  if (!maybeRuleNode) {
    console.error("Rule not found in map", id, filterMap);
    throw new Error("Rule not found in map");
  }
  let depth = 0;
  let currentRule = filterMap[id]!;

  // Iterate until a rule is root.
  while (!isRoot(currentRule)) {
    depth++; // Increment depth for each parent found.
    const parentNode = filterMap[currentRule.parentId];
    if (!parentNode) {
      console.error("Rule not found in map", id, filterMap);
      throw new Error("Rule not found in map");
    }
    currentRule = parentNode;
  }
  return depth;
};
