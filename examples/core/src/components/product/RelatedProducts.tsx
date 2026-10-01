import { createElasticPathClient } from "src/lib/create-elastic-path-client"
import {
  fetchRelatedProducts,
  RELATED_PRODUCTS_HEADING,
} from "src/lib/fetch-related-products"
import ProductStrip from "../product-strip/ProductStrip"

interface RelatedProductsProps {
  productId: string
  lang?: string
  currencyCode?: string
}

export default async function RelatedProducts({
  productId,
  lang,
  currencyCode,
}: RelatedProductsProps) {
  const client = createElasticPathClient()
  const related = await fetchRelatedProducts(client, productId, {
    lang,
    currencyCode,
  })

  if (related.length === 0) {
    return null
  }

  return (
    <div className="mt-12 lg:mt-16">
      <ProductStrip title={RELATED_PRODUCTS_HEADING} products={related} />
    </div>
  )
}
