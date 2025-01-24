"use client";

import { CartItemWide } from "./CartItemWide";
import { useCart, useProducts } from "@elasticpath/react-shopper-hooks";

export function YourBag() {
  const { data } = useCart();
  const productSlugMap = new Map<string, string>();
  const state = data?.state;
  const productResult = useProducts({ filter: { in: { id: state?.items.map(cartItem => cartItem.product_id) } } }, { enabled: state?.items && state?.items?.length > 0, });
  productResult?.data?.data?.forEach((product) => {
    productSlugMap.set(product.id, product.attributes.slug)
  });
  return (
    <ul role="list" className="flex flex-col items-start gap-5 self-stretch">
      {state?.items.map((item) => {
        return (
          <li
            key={item.id}
            className="self-stretch border-t border-zinc-300 py-5"
          >
            <CartItemWide item={item} productSlug={productSlugMap.get(item.product_id)} />
          </li>
        );
      })}
    </ul>
  );
}
