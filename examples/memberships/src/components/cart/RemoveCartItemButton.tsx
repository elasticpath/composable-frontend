"use client";
import { useNotify } from "../../hooks/use-event";
import { useQueryClient } from "@tanstack/react-query";
import { useTransition } from "react";
import { removeCartItemAction } from "../../app/(store)/products/[productId]/actions/cart-actions";
import { getCookie } from "cookies-next/client";
import { CART_COOKIE_NAME } from "../../lib/cookie-constants";
import { getACartQueryKey } from "@epcc-sdk/sdks-shopper/react-query";
import { client } from "../../lib/client";
import { LoadingDots } from "../LoadingDots";

const cartErrorOptions = {
  scope: "cart",
  type: "error",
  action: "remove-cart-item",
} as const;

export function RemoveCartItemButton({ cartItemId }: { cartItemId: string }) {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  async function handleRemoveItem() {
    startTransition(async () => {
      try {
        const result = await removeCartItemAction({ cartItemId });

        if (result.error) {
          notify({
            ...cartErrorOptions,
            message: (result.error as any).errors[0]?.detail,
            cause: {
              type: "cart-store-error",
              cause: new Error(JSON.stringify(result.error)),
            },
          });
        } else {
          notify({
            scope: "cart",
            type: "success",
            action: "remove-cart-item",
            message: "Successfully removed cart item",
          });
        }
      } catch (err) {
        notify({
          ...cartErrorOptions,
          message: "Failed to remove cart item",
          cause: {
            type: "cart-store-error",
            cause: err as Error,
          },
        });
      } finally {
        const cartID = getCookie(CART_COOKIE_NAME)!;
        const queryKey = getACartQueryKey({
          client,
          path: {
            cartID: cartID,
          },
          query: {
            include: ["items"],
          },
        });
        await queryClient.invalidateQueries({ queryKey });
      }
    });
  }

  return isPending ? (
    <LoadingDots className="bg-black" />
  ) : (
    <button
      type="button"
      className="text-sm underline text-black/60"
      onClick={handleRemoveItem}
    >
      Remove
    </button>
  );
}
