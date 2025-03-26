import { getCartQueryKey, ProductData } from "@epcc-sdk/sdks-shopper";
import { StockLocations } from "@epcc-sdk/sdks-shopper/dist/client/types.gen";
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
import { client } from "../../../lib/client";

export const variationsProductSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
  location: z.string().optional(),
});

const cartErrorOptions = {
  scope: "cart",
  type: "error",
  action: "add-product",
} as const;

export function VariationProductForm({
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

  const form = useForm<z.infer<typeof variationsProductSchema>>({
    defaultValues: {
      productId: product.data?.id ?? "",
      quantity: 1,
      location: locations ? Object.keys(locations)[0] : "",
    },
    resolver: zodResolver(variationsProductSchema),
  });

  async function handleSubmit(data: z.infer<typeof variationsProductSchema>) {
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
      const queryKey = getCartQueryKey({
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
      <form onSubmit={form.handleSubmit(handleSubmit)}>{children}</form>
    </Form>
  );
}
