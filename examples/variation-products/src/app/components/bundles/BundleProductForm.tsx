"use client"
import {
  ProductData,
  StockLocations,
} from "@epcc-sdk/sdks-shopper"
import { ReactNode, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "../form/Form"
import { createBundleFormSchema } from "./validation-schema"
import { selectedOptionsToFormValues } from "./form-parsers"
import { addToBundleAction } from "../../products/[id]/actions/cart-actions"

export function BundleProductForm({
  product,
  locations,
  children,
}: {
  product: ProductData
  locations?: StockLocations
  children: ReactNode
}) {
  const validationSchema = useMemo(
    () => createBundleFormSchema(product.data?.attributes?.components ?? {}),
    [product],
  )

  if (!product.data?.meta?.bundle_configuration?.selected_options) {
    throw new Error("Bundle product must provide selected options")
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
  })

  async function handleSubmit(data: z.infer<typeof validationSchema>) {
    try {
      const result = await addToBundleAction(data)
      if (result.error) {
        console.error("Failed to add bundle to cart:", result.error)
        alert("Failed to add bundle to cart. Please try again.")
      } else {
        console.log("Successfully added bundle to cart")
        alert("Bundle added to cart!")
      }
    } catch (err) {
      console.error("Error adding bundle to cart:", err)
      alert("An error occurred. Please try again.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>{children}</form>
    </Form>
  )
}