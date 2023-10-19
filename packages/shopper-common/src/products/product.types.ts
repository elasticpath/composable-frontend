import type { DeepOmit, UnDot } from "../shared/types/deep-omit"
import type {
  CatalogsProductVariation,
  ProductResponse,
  File,
} from "@moltin/sdk"
import type { MatrixObjectEntry } from "../shared/types/matrix-object-entry"

export interface ProductBase {
  main_image: File | null
  otherImages: File[]
}

export type VariationProduct = BaseProduct | ChildProduct

export type BaseProductResponse = DeepOmit<
  ProductResponse,
  UnDot<"attributes.components">
>

export interface BaseProduct extends ProductBase {
  kind: "base-product"
  variations: CatalogsProductVariation[]
  variationsMatrix: MatrixObjectEntry
  response: BaseProductResponse
}

export type ChildProductResponse = DeepOmit<
  ProductResponse,
  UnDot<"attributes.components">
>

export interface ChildProduct extends ProductBase {
  kind: "child-product"
  baseProduct: ProductResponse
  variations: CatalogsProductVariation[]
  variationsMatrix: MatrixObjectEntry
  response: ChildProductResponse
}

export type SimpleProductResponse = DeepOmit<
  ProductResponse,
  UnDot<"attributes.components">
>

export interface SimpleProduct extends ProductBase {
  kind: "simple-product"
  response: SimpleProductResponse
}

export type BundleProductResponse = DeepOmit<
  ProductResponse,
  ["attributes", "base_product_id"]
>

export interface BundleProduct extends ProductBase {
  kind: "bundle-product"
  response: BundleProductResponse
  componentProductResponses: ProductResponse[]
  componentProductImages: File[]
}

export type ShopperProduct = VariationProduct | SimpleProduct | BundleProduct
