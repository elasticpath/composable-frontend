import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";

const buttonVariants = cva(
  "inline-flex items-center justify-center hover:opacity-90 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-black text-white",
        secondary: "bg-transparent ring-2 ring-inset ring-black text-black",
        ghost: "bg-brand-gray/10 text-black/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-8 py-3 text-lg",
        medium: "px-6 py-2 text-base",
        small: "px-3.5 py-1.5 text-sm",
        icon: "w-10",
      },
      reversed: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        reversed: true,
        className: "bg-white text-black",
      },
      {
        variant: "secondary",
        reversed: true,
        className: "ring-white text-white",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "default",
      reversed: false,
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, size, reversed, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, reversed, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
