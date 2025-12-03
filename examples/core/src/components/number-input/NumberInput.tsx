"use client";
import { useMemo } from "react";
import { NumberInput as NumInput } from "./NumberInputComponent";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../form/Form";
import { updateCartItemAction } from "../../app/[lang]/(store)/products/[productId]/actions/cart-actions";
import { getCookie } from "cookies-next/client";
import { CART_COOKIE_NAME } from "../../lib/cookie-constants";
import { getACartQueryKey } from "@epcc-sdk/sdks-shopper/react-query";
import { client } from "../../lib/client";
import { useNotify } from "../../hooks/use-event";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "../../lib/cn";
import { Item } from "../../lib/group-cart-items";

import type { JSX } from "react";

interface NumberInputProps {
  item: Item;
}

const quantitySchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().min(0),
  location: z.string().optional(),
});

const cartErrorOptions = {
  scope: "cart",
  type: "error",
  action: "update-cart-item",
} as const;

export const NumberInput = ({ item }: NumberInputProps): JSX.Element => {
  const notify = useNotify();
  const queryClient = useQueryClient();

  const values = useMemo(() => {
    return {
      itemId: item?.id!,
      quantity: item?.quantity!,
      location: (item as { location?: string } | undefined)?.location,
    };
  }, [item]);

  const form = useForm({
    values,
    resolver: zodResolver(quantitySchema),
  });

  async function handleSubmit({
    itemId,
    quantity,
    location,
  }: z.infer<typeof quantitySchema>) {
    try {
      const result = await updateCartItemAction({
        cartItemId: itemId,
        quantity,
        location,
      });

      if (result.error) {
        notify({
          ...cartErrorOptions,
          message: (result.error as any).errors[0]?.detail,
          cause: {
            type: "cart-store-error",
            cause: new Error(JSON.stringify(result.error)),
          },
        });
        form.reset();
      } else {
        notify({
          scope: "cart",
          type: "success",
          action: "update-cart-item",
          message: "Successfully updated cart item",
        });
        form.reset({
          itemId,
          quantity,
          location,
        });
      }
    } catch (err) {
      notify({
        ...cartErrorOptions,
        message: "Failed to update cart item",
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
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="flex flex-row gap-5 lg:flex-col items-center lg:gap-2">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field: { onChange, ...field } }) => (
              <div className="flex flex-col">
                <div className="flex items-start rounded-lg border border-black/10">
                  <FormItem>
                    <FormControl>
                      <NumInput
                        onValueChange={(value) => onChange(value)}
                        {...field}
                        isPending={form.formState.isSubmitting}
                        min={0}
                        className="max-w-12 pt-1.5 pb-1 border-none justify-center"
                      />
                    </FormControl>
                  </FormItem>
                </div>

                <FormMessage />
              </div>
            )}
          />
          <button
            className={cn(
              "text-sm underline text-black/60 hidden",
              form.formState.dirtyFields.quantity && "block",
            )}
          >
            Update
          </button>
        </div>
      </form>
    </Form>
  );
};
