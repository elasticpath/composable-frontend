import { DependencyList, EffectCallback, useEffect } from "react";

export const useDebouncedEffect = (
  effect: EffectCallback,
  delay: number,
  deps?: DependencyList,
) => {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || []), delay]);
};
