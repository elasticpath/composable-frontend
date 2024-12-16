"use client";

import { useState } from "react";
import { TextButton } from "../button/TextButton";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Input } from "../input/Input";
import { Button } from "../button/Button";
import { applyDiscount } from "./actions";
import { useQueryClient } from "@tanstack/react-query";
import { cartQueryKeys, useCart } from "@elasticpath/react-shopper-hooks";
import { useFormStatus } from "react-dom";
import { LoadingDots } from "../LoadingDots";

export function AddPromotion() {
  const [showInput, setShowInput] = useState(false);
  const queryClient = useQueryClient();
  const { data } = useCart();
  const [error, setError] = useState<string | undefined>(undefined);

  async function clientAction(formData: FormData) {
    setError(undefined);

    const result = await applyDiscount(formData);

    setError(result.error);

    data?.cartId &&
      (await queryClient.invalidateQueries({
        queryKey: cartQueryKeys.detail(data.cartId),
      }));

    !result.error && setShowInput(false);
  }

  return showInput ? (
    <div className="flex flex-col gap-5">
      <form
        action={clientAction}
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
