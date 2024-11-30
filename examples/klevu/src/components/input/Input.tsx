import { cn } from "../../lib/cn";
import { forwardRef, InputHTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "flex w-full text-black/80 rounded-lg border border-input border-black/40 focus-visible:ring-0 focus-visible:border-black bg-background disabled:cursor-not-allowed disabled:opacity-50 leading-[1.6rem]",
  {
    variants: {
      sizeKind: {
        default: "px-4 py-[0.78rem]",
        medium: "px-4 py-[0.44rem]",
        mediumUntilSm: "px-4 py-[0.44rem] sm:px-4 sm:py-[0.78rem]",
      },
    },
    defaultVariants: {
      sizeKind: "default",
    },
  },
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  asChild?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, sizeKind, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ sizeKind, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
