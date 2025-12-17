"use client";
import { CheckoutForm as CheckoutFormSchemaType } from "src/components/checkout/form-schema/checkout-form-schema";
import {
  RadioGroup,
  RadioGroupItem,
} from "src/components/radio-group/RadioGroup";
import { Label } from "src/components/label/Label";
import { cn } from "src/lib/cn";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "src/components/form/Form";
import { useFormContext } from "react-hook-form";
import { LightBulbIcon } from "@heroicons/react/24/outline";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "src/components/alert/Alert";
import { ShippingMethod } from "./useShippingMethod";

type DeliveryFormProps = {
  shippingMethods: ShippingMethod[];
};

export function DeliveryForm({ shippingMethods }: DeliveryFormProps) {
  const { control } = useFormContext<CheckoutFormSchemaType>();

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
                {shippingMethods.map((option, optionIndex) => {
                  return (
                    <div
                      key={option.value}
                      className={cn(
                        "flex items-center border border-black/40 py-2.5 px-5",
                        optionIndex === 0 ? "rounded-tl-md rounded-tr-md" : "",
                        optionIndex === 0 && shippingMethods.length !== 1
                          ? "border-b-0"
                          : "",
                        optionIndex === shippingMethods.length - 1
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
    </fieldset>
  );
}
