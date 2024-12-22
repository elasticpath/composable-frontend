"use client";
import { CheckoutForm as CheckoutFormSchemaType } from "../../../components/checkout/form-schema/checkout-form-schema";
import {
  RadioGroup,
  RadioGroupItem,
} from "../../../components/radio-group/RadioGroup";
import { Label } from "../../../components/label/Label";
import { cn } from "../../../lib/cn";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/form/Form";
import { useFormContext } from "react-hook-form";
import { useShippingMethod } from "./useShippingMethod";
import { LightBulbIcon } from "@heroicons/react/24/outline";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/alert/Alert";
import { Skeleton } from "../../../components/skeleton/Skeleton";

export function DeliveryForm() {
  const { control } = useFormContext<CheckoutFormSchemaType>();
  const { data: deliveryOptions } = useShippingMethod();

  return (
    <fieldset className="flex flex-col gap-6 self-stretch">
      <div>
        <legend className="text-2xl font-medium">Delivery</legend>
      </div>
      <Alert>
        <LightBulbIcon className="h-4 w-4" />
        <AlertTitle>Delivery is using fixed rates!</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>
            Delivery is fixed rate data for testing. You can replace this with a
            3rd party service.
          </p>
        </AlertDescription>
      </Alert>
      {!deliveryOptions ? (
        <div className="flex flex-col flex-1 items-center gap-2 h-10">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <FormField
          control={control}
          name="shippingMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shipping Method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  {deliveryOptions.map((option, optionIndex) => {
                    return (
                      <div
                        key={option.value}
                        className={cn(
                          "flex items-center border border-black/40 py-2.5 px-5",
                          optionIndex === 0
                            ? "rounded-tl-md rounded-tr-md"
                            : "",
                          optionIndex === 0 && deliveryOptions.length !== 1
                            ? "border-b-0"
                            : "",
                          optionIndex === deliveryOptions.length - 1
                            ? "rounded-bl-md rounded-br-md"
                            : "",
                        )}
                      >
                        <div
                          className={cn(
                            "flex flex-1 items-center space-x-2 h-10",
                          )}
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                          />
                          <Label
                            className="hover:cursor-pointer"
                            htmlFor={option.value}
                          >
                            {option.label}
                          </Label>
                        </div>
                        <span className="">{option.formatted}</span>
                      </div>
                    );
                  })}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </fieldset>
  );
}
