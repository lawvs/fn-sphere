export const genId = () => Math.random().toString(36).substring(7);

export function sample<T>(arr: T[]): T {
  if (!arr.length) throw new Error("Array is empty");
  const index = Math.floor(Math.random() * arr.length);
  const item = arr[index];
  if (!item) throw new Error("Item is undefined");
  return item;
}

export const genFakeName = () =>
  sample([
    "Jack",
    "Nathan",
    "Skylar",
    "Sophia",
    "Londyn",
    "Jackson",
    "Layla",
    "Adelaide",
    "Callum",
    "Jasper",
    "Genesis",
  ]) +
  " " +
  sample([
    "Works",
    "Hamilton",
    "Carter",
    "Schultz",
    "Wright",
    "Martin",
    "Hamilton",
    "Simpson",
    "Mitchell",
    "James",
    "Howard",
  ]);
