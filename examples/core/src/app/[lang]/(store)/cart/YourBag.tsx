import { CartItemWide } from "./CartItemWide";
import { CartIncluded, ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { groupCartItems } from "src/lib/group-cart-items";

export function YourBag({
  cart,
  currency,
}: {
  cart: NonNullable<CartIncluded["items"]>;
  currency?: ResponseCurrency;
}) {
  const groupedItems = groupCartItems(cart ?? []);
  const items = [
    ...groupedItems.regular,
    ...groupedItems.subscription_offerings,
  ];

  return items && items.length > 0 ? (
    <ul role="list" className="flex flex-col items-start gap-5 self-stretch">
      {items.map((item) => {
        return (
          <li
            key={item.id}
            className="self-stretch border-t border-zinc-300 py-5"
          >
            <CartItemWide item={item} thumbnail={item.image?.href} currency={currency} />
          </li>
        );
      })}
    </ul>
  ) : null;
}
