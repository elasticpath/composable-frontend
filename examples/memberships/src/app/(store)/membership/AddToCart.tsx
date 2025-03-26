"use client";

import { useTransition } from "react";
import { addToCart } from "./add-to-cart-action";

export function AddToCartButton({
  offeringId,
  planId,
}: {
  offeringId: string;
  planId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        const result = await addToCart({ offeringId, planId });
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
