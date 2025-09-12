// Utility to pick a random element from an array
export const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
