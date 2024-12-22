"use client";
import { cn } from "../../lib/cn";
import { forwardRef, ReactNode } from "react";
import { Button, ButtonProps } from "./Button";
import LoaderIcon from "./LoaderIcon";
import { useFormStatus } from "react-dom";
import * as React from "react";

export interface FormStatusButtonProps extends ButtonProps {
  status?: "loading" | "success" | "error" | "idle";
  icon?: ReactNode;
}

const FormStatusButton = forwardRef<HTMLButtonElement, FormStatusButtonProps>(
  ({ children, icon, status = "idle", className, ...props }, ref) => {
    const { pending } = useFormStatus();
    return (
      <Button
        ref={ref}
        {...props}
        className={cn("transition-all ease-out", className)}
        disabled={pending}
      >
        {pending ? (
          <LoaderIcon
            className={cn(
              "mr-2 h-5 w-5 animate-spin",
              props.variant === "primary" || !props.variant ? "fill-white" : "",
            )}
          />
        ) : (
          icon
        )}
        {children}
      </Button>
    );
  },
);
FormStatusButton.displayName = "FormStatusButton";

export { FormStatusButton };
