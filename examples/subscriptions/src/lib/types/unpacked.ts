/**
 * https://stackoverflow.com/a/52331580/4330441
 * Extract the type of array e.g.
 * type Group = Item[]
 * type MyItem = Unpacked<Item>
 */
export type Unpacked<T> = T extends (infer U)[] ? U : T;
