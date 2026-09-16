import { createElasticPathClient } from "src/lib/create-elastic-path-client"
import { fetchBundlesContainingProduct } from "src/lib/fetch-bundles-containing-product"
import ProductStrip from "../product-strip/ProductStrip"

interface BundlesContainingProductProps {
  productId: string
  lang?: string
  currencyCode?: string
}

/**
 * The inverse of `ProductComponents`: that renders on a bundle's page and lists what
 * the bundle contains, this renders on a component product's page and lists the
 * bundles that contain it. Renders on every product type — a bundle can itself be a
 * component option of another bundle — and disappears, heading and all, when the
 * shopper's catalog holds no such bundle.
 */
export default async function BundlesContainingProduct({
  productId,
  lang,
  currencyCode,
}: BundlesContainingProductProps) {
  const client = createElasticPathClient()
  const bundles = await fetchBundlesContainingProduct(client, productId, {
    lang,
    currencyCode,
  })

  if (bundles.length === 0) {
    return null
  }

  return (
    <div className="mt-12 lg:mt-16">
      <ProductStrip title="Also sold in these bundles" products={bundles} />
    </div>
  )
}
