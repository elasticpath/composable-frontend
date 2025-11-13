"use client";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form/Form";
import { Button } from "../button/Button";
import { Input } from "../input/Input";

export const selectorSchema = z.object({
  quantity: z.number().optional(),
});

type QuantitySelectorProps = {
  maxQty?: number;
};

export function QuantitySelector({ maxQty }: QuantitySelectorProps) {
  const form = useFormContext<z.infer<typeof selectorSchema>>();

  return (
    <FormField
      control={form.control}
      name="quantity"
      render={({ field }) => {
        const currentValue = Number(field.value || 0)
        const minValue = 1
        const maxValue = maxQty || 1

        const handleIncrement = () => {
          if (currentValue < maxValue) {
            field.onChange(currentValue + 1)
          }
        }

        const handleDecrement = () => {
          if (currentValue > minValue) {
            field.onChange(currentValue - 1)
          }
        }

        return (
          <FormItem>
            <FormLabel>Quantity</FormLabel>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                size="icon"
                onClick={handleDecrement}
                disabled={currentValue <= minValue}
              >
                -
              </Button>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="1"
                  min={minValue}
                  max={maxValue}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10)
                    if (isNaN(value)) {
                      field.onChange(minValue)
                    } else if (value > maxValue) {
                      field.onChange(maxValue)
                    } else {
                      field.onChange(value)
                    }
                  }}
                  className="h-8 w-20 text-center"
                />
              </FormControl>
              <Button
                type="button"
                size="icon"
                onClick={handleIncrement}
                disabled={currentValue >= maxValue}
              >
                +
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
