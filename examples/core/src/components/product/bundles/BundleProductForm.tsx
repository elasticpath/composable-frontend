"use client";
import { getACartQueryKey } from "@epcc-sdk/sdks-shopper/react-query";
import { ProductData, StockLocations } from "@epcc-sdk/sdks-shopper";
import { ReactNode, useMemo } from "react";
import { useNotify } from "../../../hooks/use-event";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "../../form/Form";
import { addToBundleAction } from "../../../app/[lang]/(store)/products/[productId]/actions/cart-actions";
import { useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next/client";
import { CART_COOKIE_NAME } from "../../../lib/cookie-constants";
import { client } from "../../../lib/client";
import { createBundleFormSchema } from "./validation-schema";
import { selectedOptionsToFormValues } from "./form-parsers";

const cartErrorOptions = {
  scope: "cart",
  type: "error",
  action: "add-product",
} as const;

export function BundleProductForm({
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

  const validationSchema = useMemo(
    () => createBundleFormSchema(product.data?.attributes?.components ?? {}),
    [product],
  );

  if (!product.data?.meta?.bundle_configuration?.selected_options) {
    throw new Error("Bundle product must provide selected options");
  }

  const form = useForm<z.infer<typeof validationSchema>>({
    defaultValues: {
      productId: product.data.id,
      selectedOptions: selectedOptionsToFormValues(
        product.data.meta.bundle_configuration.selected_options,
      ),
      quantity: 1,
      location: locations ? Object.keys(locations)[0] : "",
    },
    resolver: zodResolver(validationSchema),
  });

  async function handleSubmit(data: z.infer<typeof validationSchema>) {
    try {
      const result = await addToBundleAction(data);
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
