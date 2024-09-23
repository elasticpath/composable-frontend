import { ErrorMessage } from "@hookform/error-message";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { get } from "react-hook-form";
import { Label } from "../../../components/label/Label";
import { Input } from "../../../components/input/Input";
import { cn } from "../../../lib/cn";

type InputProps = Omit<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  "placeholder"
> & {
  label: string;
  errors?: Record<string, unknown>;
  touched?: Record<string, unknown>;
  name: string;
};

export const FormInput = forwardRef<HTMLInputElement, InputProps>(
  ({ type, name, label, errors, touched, required, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current!);

    const hasError = get(errors, name) && get(touched, name);

    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 relative z-0">
          <div className="flex flex-1 flex-col self-stretch">
            <p>
              <Label
                htmlFor={name}
                onClick={() => inputRef.current?.focus()}
                className={cn({
                  "text-rose-500": hasError,
                })}
              >
                {label}
                {required && <span className="text-rose-500">*</span>}
              </Label>
              <Input
                name={name}
                aria-invalid={hasError}
                placeholder=" "
                sizeKind="mediumUntilSm"
                className={cn({
                  "border-rose-500 focus:border-rose-500": hasError,
                })}
                {...props}
                ref={inputRef}
              />
            </p>
          </div>
        </div>
        {hasError && (
          <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }: { message: string }) => {
              return (
                <div className="pt-1 pl-2 text-rose-500 text-xsmall-regular">
                  <span>{message}</span>
                </div>
              );
            }}
          />
        )}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
