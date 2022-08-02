export const sortAlphabetically = (
  a: { name: string },
  b: { name: string }
): number => a.name.localeCompare(b.name);

export const isEmptyObj = (obj: object): boolean =>
  Object.keys(obj).length === 0;
