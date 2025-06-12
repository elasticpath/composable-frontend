import Image from "next/image"
import Link from "next/link"
import { Product, ElasticPathFile } from "@epcc-sdk/sdks-shopper"

interface ProductCardProps {
  product: Product
  mainImage?: ElasticPathFile
}

export default function ProductCard({ product, mainImage }: ProductCardProps) {
  const name = product.attributes?.name || "Unnamed Product"
  const description = product.attributes?.description || ""
  const imageUrl = mainImage?.link?.href || "/placeholder.jpg"
  const productId = product.id

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/products/${productId}`}>
        <div className="h-48 relative overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
          <div className="mt-4">
            <span className="text-blue-600 text-sm font-medium">
              View details
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
