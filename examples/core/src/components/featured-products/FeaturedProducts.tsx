"use server"
import { fetchFeaturedProducts } from "./fetchFeaturedProducts"
import { createElasticPathClient } from "../../lib/create-elastic-path-client"
import ProductStrip from "../product-strip/ProductStrip"

interface IFeaturedProductsProps {
  title: string
  linkProps?: {
    link: string
    text: string
  }
}

export default async function FeaturedProducts({
  title,
  linkProps,
}: IFeaturedProductsProps) {
  const client = createElasticPathClient()
  const products = await fetchFeaturedProducts(client)

  return (
    <ProductStrip title={title} products={products} linkProps={linkProps} />
  )
}
