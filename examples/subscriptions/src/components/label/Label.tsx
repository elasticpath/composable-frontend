import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { forwardRef, LabelHTMLAttributes } from "react";

const labelVariants = cva(
  "text-sm font-medium text-black/80 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);
export interface LabelProps
  extends LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}
const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn(labelVariants(), className)} {...props} />
  ),
);
Label.displayName = "Label";

export { Label };
