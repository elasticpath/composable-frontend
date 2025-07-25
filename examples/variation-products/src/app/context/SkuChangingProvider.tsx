"use client"
import React, {
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  useState,
} from "react"
import { createContext } from "react"

export interface SkuChangingContextState {
  isChangingSku: boolean
  setIsChangingSku: Dispatch<SetStateAction<boolean>>
}

export const SkuChangingContext = createContext<SkuChangingContextState | null>(
  null,
)

export function SkuChangingProvider({
  children,
}: {
  children: ReactNode
}): ReactElement<any> {
  const [isChangingSku, setIsChangingSku] = useState(false)

  return (
    <SkuChangingContext.Provider
      value={{
        isChangingSku,
        setIsChangingSku,
      }}
    >
      {children}
    </SkuChangingContext.Provider>
  )
}
