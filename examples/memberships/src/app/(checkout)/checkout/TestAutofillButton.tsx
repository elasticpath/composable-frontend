"use client";
import { useFormContext } from "react-hook-form";
import type { CheckoutForm } from "../../../components/checkout/form-schema/checkout-form-schema";

const TEST_DATA = {
  shippingAddress: {
    first_name: "Jane",
    last_name: "Doe",
    line_1: "123 Test Street",
    line_2: "",
    city: "San Francisco",
    county: "",
    region: "CA",
    postcode: "94103",
    country: "US",
    phone_number: "415-555-1234",
    instructions: "",
    company_name: "",
  },
  sameAsShipping: true,
  shippingMethod: "__shipping_standard",
} as const;

export function TestAutofillButton() {
  if (process.env.NODE_ENV !== "development") return null;
  const { reset, getValues } = useFormContext<CheckoutForm>();

  return (
    <button
      type="button"
      onClick={() =>
        reset({
          ...getValues(),
          ...TEST_DATA,
          guest: {
            ...getValues("guest"),
            email: `test+${Date.now()}@example.com`,
          },
        })
      }
      className="text-xs text-gray-400 underline self-start"
    >
      [dev] fill test data
    </button>
  );
}
