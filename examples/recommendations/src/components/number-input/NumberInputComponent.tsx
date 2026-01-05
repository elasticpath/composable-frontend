"use client";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input } from "../input/Input";
import { cn } from "../../lib/cn";
import { LoadingDots } from "../LoadingDots";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

export interface NumberInputProps
  extends Omit<NumericFormatProps, "value" | "onValueChange"> {
  stepper?: number;
  thousandSeparator?: string;
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  value?: number; // Controlled value
  suffix?: string;
  prefix?: string;
  onValueChange?: (value: number | undefined) => void;
  fixedDecimalScale?: boolean;
  decimalScale?: number;
  isPending?: boolean;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      stepper,
      thousandSeparator,
      placeholder,
      defaultValue,
      min = -Infinity,
      max = Infinity,
      onValueChange,
      fixedDecimalScale = false,
      decimalScale = 0,
      suffix,
      prefix,
      value: controlledValue,
      isPending,
      className,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = useState<number | undefined>(
      controlledValue ?? defaultValue,
    );

    const handleIncrement = useCallback(() => {
      setValue((prev) =>
        prev === undefined
          ? (stepper ?? 1)
          : Math.min(prev + (stepper ?? 1), max),
      );
    }, [stepper, max]);

    const handleDecrement = useCallback(() => {
      setValue((prev) =>
        prev === undefined
          ? -(stepper ?? 1)
          : Math.max(prev - (stepper ?? 1), min),
      );
    }, [stepper, min]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          document.activeElement ===
          (ref as React.RefObject<HTMLInputElement | null>).current
        ) {
          if (e.key === "ArrowUp") {
            handleIncrement();
          } else if (e.key === "ArrowDown") {
            handleDecrement();
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [handleIncrement, handleDecrement, ref]);

    useEffect(() => {
      if (controlledValue !== undefined) {
        setValue(controlledValue);
      }
    }, [controlledValue]);

    const handleChange = (values: {
      value: string;
      floatValue: number | undefined;
    }) => {
      const newValue =
        values.floatValue === undefined ? undefined : values.floatValue;
      setValue(newValue);

      if (onValueChange) {
        onValueChange(newValue);
      }
    };

    const handleBlur = () => {
      if (value !== undefined) {
        if (value < min) {
          setValue(min);
          (ref as React.RefObject<HTMLInputElement | null>).current!.value =
            String(min);
        } else if (value > max) {
          setValue(max);
          (ref as React.RefObject<HTMLInputElement | null>).current!.value =
            String(max);
        }
      }
    };

    return (
      <div className="flex items-center">
        <button
          type="submit"
          disabled={isPending || value === min}
          onClick={handleDecrement}
          aria-label="Increase item quantity"
          aria-disabled={isPending}
          className={cn(
            "ease flex w-9 h-9 p-2 justify-center items-center transition-all duration-200 ml-auto",
            {
              "cursor-not-allowed": isPending,
            },
          )}
        >
          {isPending ? (
            <LoadingDots className="bg-black" />
          ) : (
            <MinusIcon className="h-4 w-4 dark:text-neutral-500" />
          )}
        </button>

        <svg
          width="2"
          height="36"
          viewBox="0 0 2 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 0V36"
            stroke="black"
            strokeOpacity="0.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <NumericFormat
          value={value}
          onValueChange={handleChange}
          thousandSeparator={thousandSeparator}
          decimalScale={decimalScale}
          fixedDecimalScale={fixedDecimalScale}
          allowNegative={min < 0}
          valueIsNumericString
          onBlur={handleBlur}
          max={max}
          min={min}
          suffix={suffix}
          prefix={prefix}
          customInput={Input}
          placeholder={placeholder}
          className={cn(
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-r-none relative",
            className,
          )}
          getInputRef={ref}
          {...props}
        />
        <svg
          width="2"
          height="36"
          viewBox="0 0 2 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 0V36"
            stroke="black"
            strokeOpacity="0.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <button
          type="submit"
          disabled={isPending || value === max}
          onClick={handleIncrement}
          aria-label="Increase item quantity"
          aria-disabled={isPending}
          className={cn(
            "ease flex w-9 h-9 p-2 justify-center items-center transition-all duration-200",
            {
              "cursor-not-allowed": isPending,
            },
          )}
        >
          {isPending ? (
            <LoadingDots className="bg-black" />
          ) : (
            <PlusIcon className="h-4 w-4 dark:text-neutral-500" />
          )}
        </button>
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";
