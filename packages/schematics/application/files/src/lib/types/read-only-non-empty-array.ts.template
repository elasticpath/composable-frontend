export type ReadonlyNonEmptyArray<A> = ReadonlyArray<A> & {
  readonly 0: A;
};

export const isNonEmpty = <A>(
  as: ReadonlyArray<A>
): as is ReadonlyNonEmptyArray<A> => as.length > 0;
