import { Included, Product } from "../client"

export const extractProductImage = (
  product: Product,
  images: Included["main_images"],
) => {
  return images?.find((file) => {
    if (file.id === product.relationships?.main_image?.data?.id) {
      return file
    }
  })
}
