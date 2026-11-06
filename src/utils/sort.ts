export function sortList<T>(
  list: T[],
  comparator: (a: T, b: T) => number,
): T[] {
  return [...list].sort(comparator);
}
