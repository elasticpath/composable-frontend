import { z } from "zod"
import { Components } from "@epcc-sdk/sdks-shopper"
import { ComponentProduct } from "@epcc-sdk/sdks-shopper"

export const createBundleComponentSchema = (component: ComponentProduct) => {
  let schema = z.array(z.string())

  const { min, max } = component

  if (min) {
    schema = schema.min(min, `Must select at least ${min} options`)
  }

  if (max) {
    schema = schema.max(max, `Must select no more than ${max} options`)
  }
  return schema
}

export const createBundleFormSchema = (bundleComponents: Components) => {
  const selectedOptionsSchema = Object.keys(bundleComponents).reduce(
    (acc, componentKey) => {
      return {
        ...acc,
        [componentKey]: createBundleComponentSchema(
          bundleComponents[componentKey]!,
        ),
      }
    },
    {} as Record<string, ReturnType<typeof createBundleComponentSchema>>,
  )

  return z.object({
    productId: z.string(),
    selectedOptions: z.object(selectedOptionsSchema),
    quantity: z.number(),
    location: z.string().optional(),
  })
}