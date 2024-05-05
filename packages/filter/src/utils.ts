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

export const EMPTY_ROOT_FILTER = {
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
    return JSON.parse(storedValue);
  },
  setItem: (key, newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue));
  },
};
