import { ReactNode, useContext } from "react";
import { SkuChangingContext } from "../../lib/sku-changing-context";
import clsx from "clsx";

export function SkuChangeOpacityWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(SkuChangingContext);
  return (
    <div
      className={clsx(
        className,
        context?.isChangingSku && "opacity-20 cursor-default",
      )}
    >
      {children}
    </div>
  );
}
