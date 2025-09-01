"use client";
import { ProductData } from "@epcc-sdk/sdks-shopper";
import { getACartQueryKey } from "@epcc-sdk/sdks-shopper/react-query";
import { type StockLocations } from "@epcc-sdk/sdks-shopper";
import { ReactNode } from "react";
import { useNotify } from "../../../hooks/use-event";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "../../form/Form";
import { addToCartAction } from "../../../app/(store)/products/[productId]/actions/cart-actions";
import { useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next/client";
import { CART_COOKIE_NAME } from "../../../lib/cookie-constants";

export const simpleProductSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
  location: z.string().optional(),
});

const cartErrorOptions = {
  scope: "cart",
  type: "error",
  action: "add-product",
} as const;

export function SimpleProductForm({
  product,
  locations,
  children,
}: {
  product: ProductData;
  locations?: StockLocations;
  children: ReactNode;
}) {
  const notify = useNotify();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof simpleProductSchema>>({
    defaultValues: {
      productId: product.data?.id ?? "",
      quantity: 1,
      location: locations ? Object.keys(locations)[0] : "",
    },
    resolver: zodResolver(simpleProductSchema),
  });

  async function handleSubmit(data: z.infer<typeof simpleProductSchema>) {
    try {
      const result = await addToCartAction(data);

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
          action: "add-product",
          message: "Successfully added product to cart",
        });
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>{children}</form>
    </Form>
  );
}
