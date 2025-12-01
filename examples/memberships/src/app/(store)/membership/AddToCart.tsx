"use client";

import { useTransition } from "react";
import { addToCart } from "./add-to-cart-action";

export function AddToCartButton({
  offeringId,
  planId,
  pricingOptionId,
}: {
  offeringId: string;
  planId: string;
  pricingOptionId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        const result = await addToCart({ offeringId, planId, pricingOptionId });
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="px-4 py-2 bg-pink-500"
    >
      {isPending ? "Adding..." : "Add offering to cart"}
    </button>
  );
}
