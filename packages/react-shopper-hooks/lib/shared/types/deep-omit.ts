export type Tail<T extends any[]> = ((...t: T) => void) extends (
  h: any,
  ...r: infer R
) => void
  ? R
  : never

export type DeepOmit<T, Path extends string[]> = T extends object
  ? Path["length"] extends 1
    ? Omit<T, Path[0]>
    : {
        [K in keyof T]: K extends Path[0] ? DeepOmit<T[K], Tail<Path>> : T[K]
      }
  : T

export type UnDot<T extends string> = T extends `${infer A}.${infer B}`
  ? [A, ...UnDot<B>]
  : [T]
