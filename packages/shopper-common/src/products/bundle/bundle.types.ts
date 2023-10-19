import type { BundleProduct } from "../product.types"
import type { ProductResponse } from "@moltin/sdk"

export type BundleComponents =
  BundleProduct["response"]["attributes"]["components"]
export type BundleComponent = BundleComponents[0]
export type BundleConfiguration = NonNullable<
  BundleProduct["response"]["meta"]["bundle_configuration"]
>
export type BundleConfigurationSelectedOptions = NonNullable<
  BundleProduct["response"]["meta"]["bundle_configuration"]
>["selected_options"]
export type ComponentProduct = ProductResponse
