import { useQuery } from "@tanstack/react-query";

export type ShippingMethod = {
  label: string;
  value: string;
  amount: number;
  formatted: string;
};

export const staticDeliveryMethods: ShippingMethod[] = [
  {
    label: "Standard",
    value: "__shipping_standard",
    amount: 0,
    formatted: "Free",
  },
  {
    label: "Express",
    value: "__shipping_express",
    amount: 1200,
    formatted: "$12.00",
  },
];

export function useShippingMethod() {
  const deliveryMethods = useQuery({
    queryKey: ["delivery-methods"],
    queryFn: () => {
      /**
       * Replace these with your own delivery methods. You can also fetch them from the API.
       */
      return staticDeliveryMethods;
    },
  });

  return {
    ...deliveryMethods,
  };
}
