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

/**
 * The products a merchandiser related to this one through a Custom Relationship,
 * read with the shopper's own token. The shopper view is a catalog release, so a
 * relationship edit shows here after the catalog is republished. Disappears, heading
 * and all, when the product has no such relationship or it is empty.
 */
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
