"use client";

import { useState } from "react";
import { TextButton } from "../button/TextButton";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Input } from "../input/Input";
import { Button } from "../button/Button";
import { applyDiscount } from "./actions";
import { useQueryClient } from "@tanstack/react-query";
import { useFormStatus } from "react-dom";
import { LoadingDots } from "../LoadingDots";
import { getACartQueryKey } from "@epcc-sdk/sdks-shopper/react-query";
import { getCookie } from "cookies-next/client";
import { CART_COOKIE_NAME } from "../../lib/cookie-constants";
import { useNotify } from "../../hooks/use-event";

const cartErrorOptions = {
  scope: "cart",
  type: "error",
  action: "add-promotion",
} as const;

export function AddPromotion() {
  const [showInput, setShowInput] = useState(false);
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | undefined>(undefined);
  const notify = useNotify();

  async function handleSubmit(formData: FormData) {
    setError(undefined);

    try {
      const result = await applyDiscount(formData);

      if (result.error) {
        notify({
          ...cartErrorOptions,
          message: (result.error as any).errors[0]?.detail,
          cause: {
            type: "cart-store-error",
            cause: new Error(JSON.stringify(result.error)),
          },
        });
        setError(result.error);
      } else {
        notify({
          scope: "cart",
          type: "success",
          action: "add-product",
          message: "Successfully added product to cart",
        });
        setShowInput(false);
      }
    } catch (err) {
      notify({
        ...cartErrorOptions,
        message: "Failed to add product to cart",
        cause: {
          type: "cart-store-error",
          cause: err as Error,
        },
      });
    } finally {
      const cartID = getCookie(CART_COOKIE_NAME)!;
      const queryKey = getACartQueryKey({
        path: {
          cartID: cartID,
        },
        query: {
          include: ["items"],
        },
      });
      await queryClient.invalidateQueries({ queryKey });
    }
  }

  return showInput ? (
    <div className="flex flex-col gap-5">
      <form
        action={handleSubmit}
        className="flex items-start gap-2 self-stretch"
      >
        <Input
          id="code"
          name="code"
          sizeKind="medium"
          placeholder="Gift card or discount code"
          required
        />
        <ApplyButton />
      </form>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  ) : (
    <TextButton onClick={() => setShowInput(true)}>
      <PlusIcon className="w-5 h-5" /> Add discount code
    </TextButton>
  );
}

function ApplyButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="medium">
      {pending ? (
        <div className="flex items-center h-6">
          <LoadingDots className="bg-white " />
        </div>
      ) : (
        "Apply"
      )}
    </Button>
  );
}
