"use client";

import { CartItemWide } from "./CartItemWide";
import { useCart, useProducts } from "@elasticpath/react-shopper-hooks";

export function YourBag() {
  const { data } = useCart();
  const state = data?.state;

  return (
    <ul role="list" className="flex flex-col items-start gap-5 self-stretch">
      {state?.items.map((item) => {
        return (
          <li
            key={item.id}
            className="self-stretch border-t border-zinc-300 py-5"
          >
            <CartItemWide item={item} productSlug={item.slug} />
          </li>
        );
      })}
    </ul>
  );
}
