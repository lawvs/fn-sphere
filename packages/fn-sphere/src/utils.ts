/**
 * Simple get function
 * See https://gist.github.com/jeneg/9767afdcca45601ea44930ea03e0febf
 *
 * @example
 * ```ts
 * const obj = {
 *  selector: { to: { val: "val" } },
 *  target: [1, 2, { a: "test" }],
 * };
 *
 * get(obj, "selector.to.val"); // "val"
 * get(obj, "target.2.a"); // "test"
 */
export const get = <T = unknown>(
  value: any,
  path: string,
  defaultValue?: T,
): T => {
  if (!path) {
    return value;
  }
  return String(path)
    .split(".")
    .filter(Boolean)
    .reduce((acc, v) => {
      try {
        acc = acc[v];
      } catch (e) {
        return defaultValue;
      }
      return acc;
    }, value);
};
