export const genId = () => Math.random().toString(36).substring(7);

export const sample = <T>(arr: T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

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
