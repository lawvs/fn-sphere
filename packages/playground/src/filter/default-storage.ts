import type { LooseFilterGroup } from "@fn-sphere/core";

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
