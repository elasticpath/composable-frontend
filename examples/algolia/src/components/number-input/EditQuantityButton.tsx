"use client";
import { FormEvent } from "react";
import { cn } from "../../lib/cn";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { LoadingDots } from "../LoadingDots";
import type { CartItem } from "@elasticpath/js-sdk";
import { useCartUpdateItem } from "@elasticpath/react-shopper-hooks";

export function EditItemQuantityButton({
  item,
  type,
}: {
  item: CartItem;
  type: "plus" | "minus";
}) {
  const { mutate, isPending } = useCartUpdateItem();

  return (
    <>
      <button
        type="submit"
        onClick={(e: FormEvent<HTMLButtonElement>) => {
          if (isPending) e.preventDefault();
          mutate({
            itemId: item.id,
            quantity: type === "plus" ? item.quantity + 1 : item.quantity - 1,
          });
        }}
        aria-label={
          type === "plus" ? "Increase item quantity" : "Reduce item quantity"
        }
        aria-disabled={isPending}
        className={cn(
          "ease flex w-9 h-9 p-2 justify-center items-center transition-all duration-200",
          {
            "cursor-not-allowed": isPending,
            "ml-auto": type === "minus",
          },
        )}
      >
        {isPending ? (
          <LoadingDots className="bg-black" />
        ) : type === "plus" ? (
          <PlusIcon className="h-4 w-4 dark:text-neutral-500" />
        ) : (
          <MinusIcon className="h-4 w-4 dark:text-neutral-500" />
        )}
      </button>
      <p aria-live="polite" className="sr-only" role="status">
        updating
      </p>
    </>
  );
}
