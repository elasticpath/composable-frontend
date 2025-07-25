import { SkuChangingContext } from "@/app/context/SkuChangingProvider"
import { ReactNode, useContext } from "react"

export function SkuChangeOpacityWrapper({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const context = useContext(SkuChangingContext)
  return (
    <div
      className={`${className} ${
        context?.isChangingSku && "opacity-20 cursor-default"
      }`}
    >
      {children}
    </div>
  )
}
