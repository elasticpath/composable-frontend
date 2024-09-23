import { cva, VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";

const textButtonVariants = cva(
  "font-medium text-black flex items-center gap-2 shrink-0",
  {
    variants: {
      size: {
        default: "text-lg",
        small: "text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface TextButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof textButtonVariants> {
  asChild?: boolean;
}

const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(
  ({ className, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(textButtonVariants({ size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
TextButton.displayName = "TextButton";

export { TextButton, textButtonVariants };
