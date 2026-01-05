"use client";
import React, { ReactElement, ReactNode, useState } from "react";
import { SkuChangingContext } from "../../lib/sku-changing-context";

export function SkuChangingProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement<any> {
  const [isChangingSku, setIsChangingSku] = useState(false);

  return (
    <SkuChangingContext.Provider
      value={{
        isChangingSku,
        setIsChangingSku,
      }}
    >
      {children}
    </SkuChangingContext.Provider>
  );
}
