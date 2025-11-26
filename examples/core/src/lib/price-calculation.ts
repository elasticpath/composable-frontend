import { ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { formatCurrency } from "./format-currency";
import { Item } from "./group-cart-items";

export function getFormattedValue(value: number, currency: ResponseCurrency) {
  return value
    ? formatCurrency(value || 0, currency || { code: "USD", decimal_places: 2 })
    : undefined
}

export function getFormattedPercentage(savings: number, total: number) {
  const savingsAmount = Math.abs(savings ?? 0);
  const savingsPercentage =
    savingsAmount && total ? (savingsAmount / total) * 100 : 0;
  return savingsPercentage > 0 ? Math.round(savingsPercentage) + "%" : "";
}

export function calculateMultiItemOriginalTotal(item: Item) {
  const itemQuantity = item.quantity || 1;
  const originalDisplayPrice = (item as any).productDetail?.meta?.original_display_price?.without_tax;
  return originalDisplayPrice
    ? itemQuantity * originalDisplayPrice.amount
    : undefined
}

export function calculateSaleAmount(item: Item) {
  const multiItemOriginalTotal = calculateMultiItemOriginalTotal(item);
  const itemWithoutDiscountAmount = item.meta?.display_price?.without_discount?.value?.amount;
  return multiItemOriginalTotal && itemWithoutDiscountAmount
    ? itemWithoutDiscountAmount - multiItemOriginalTotal
    : undefined
}

export function calculateTotalSavings(item: Item) {
  const saleAmount = calculateSaleAmount(item);
  const itemTotalDiscount = item?.meta?.display_price?.discount?.value?.amount;
  return (saleAmount ?? 0) + (itemTotalDiscount ?? 0) //itemTotalSavings
}
