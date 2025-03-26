import { cn } from "../../lib/cn";
import { forwardRef } from "react";
import { Button, ButtonProps } from "./Button";
import { CheckIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";
import LoaderIcon from "./LoaderIcon";

export interface StatusButtonProps extends ButtonProps {
  status?: "loading" | "success" | "error" | "idle";
}

const StatusButton = forwardRef<HTMLButtonElement, StatusButtonProps>(
  ({ children, status = "idle", className, ...props }, ref) => {
    const Icon =
      status === "loading"
        ? LoaderIcon
        : status === "success"
          ? CheckIcon
          : status === "error"
            ? XMarkIcon
            : null;

    return (
      <Button
        ref={ref}
        {...props}
        className={cn("transition-all ease-out", className)}
      >
        {Icon && (
          <Icon
            className={cn(
              props.variant === "primary" || !props.variant
                ? "text-white"
                : "text-black",
              "mr-2 h-4 w-4 fill-current",
              status === "loading" && "animate-spin",
            )}
          />
        )}
        {children}
      </Button>
    );
  },
);
StatusButton.displayName = "StatusButton";

export { StatusButton };
