/**
 * This function should never be called. If it is called, it means that the
 * code has reached a point that should be unreachable.
 *
 * @example
 * ```ts
 * function f(val: 'a' | 'b') {
 *  if (val === 'a') {
 *   return 1;
 * } else if (val === 'b') {
 *  return 2;
 * }
 * unreachable(val);
 * ```
 */
export function unreachable(
  val: never,
  message = "Unreachable code reached",
): never {
  console.error(message, val);
  throw new Error(message);
}
