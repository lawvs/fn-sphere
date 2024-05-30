import {
  genFilterId,
  type LooseFilterGroup,
  type LooseFilterRule,
} from "@fn-sphere/core";
import type { FlattenFilterGroup } from "./types";

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
