"use client";
import { StockLocations } from "@epcc-sdk/sdks-shopper/dist/client/types.gen";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form/Form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select/Select";
import { cn } from "../../lib/cn";

export const selectorSchema = z.object({
  location: z.string().optional(),
});

export function LocationSelector({ locations }: { locations: StockLocations }) {
  const form = useFormContext<z.infer<typeof selectorSchema>>();

  return (
    <FormField
      control={form.control}
      name="location"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Location</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger
                className={cn(
                  field.value &&
                    Number(locations[field.value]?.available) < 1 &&
                    "opacity-50",
                )}
              >
                <SelectValue placeholder="Select a stock location" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.keys(locations).map((location) => {
                return (
                  <SelectItem
                    disabled={Number(locations[location]?.available) < 1}
                    key={location}
                    value={location}
                  >
                    {location} ({locations[location]?.available.toString()})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
