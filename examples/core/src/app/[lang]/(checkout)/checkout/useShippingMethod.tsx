import { getACart, ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { formatCurrency } from "src/lib/format-currency";

export type ShippingMethod = {
  label: string;
  value: string;
  amount: number;
  formatted: string;
};

// Old static delivery methods
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

// Dynamically make shipping methods using cart values
export function getShippingMethods(
  cart: Awaited<ReturnType<typeof getACart>>["data"],
  storeCurrency?: ResponseCurrency,
): ShippingMethod[] {
  const methods: ShippingMethod[] = [];

  // calculate cart total
  const cartItems = cart?.included?.items ?? [];
  const totalCartValue = cartItems.reduce((acc: any, item: any) => {
    const itemOriginalPrice =
      (item as any).productDetail?.meta?.original_display_price?.without_tax
        ?.amount ||
      (item as any).productDetail?.meta?.display_price?.without_tax?.amount ||
      0
    const itemQuantity = (item as any).quantity || 1;
    return acc + (itemOriginalPrice * itemQuantity)
  }, 0) || cart?.data?.meta?.display_price?.without_tax?.amount;

  // Example 1 — free shipping over a certain cart amount
  if (totalCartValue > 2000) {
    methods.push({
      label: "Standard",
      value: "__shipping_standard",
      amount: 0,
      formatted: "Free",
    });
  } else {
    methods.push({
      label: "Standard",
      value: "__shipping_standard",
      amount: 500,
      formatted: formatCurrency(500, storeCurrency || { code: "USD", decimal_places: 2 })
    });
  }

  // Example 2 — express shipping depending on cart total
  const expressAmount = totalCartValue && totalCartValue > 2000 ? 1400 : 2200;
  methods.push({
    label: "Express",
    value: "__shipping_express",
    amount: expressAmount,
    formatted: formatCurrency(expressAmount, storeCurrency || { code: "USD", decimal_places: 2 }),
  });

  return methods;
}