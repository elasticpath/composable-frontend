import Image from "next/image";
import Link from "next/link";
import VariationPrice from "./VariationPrice";

interface ProductVariationCardProps {
  product: any;
}

export default function ProductVariationCard({ product }: ProductVariationCardProps) {
  const variations = product.relationships?.component_products?.data || [];
  const hasVariations = variations.length > 0;
  const mainImage = product.relationships?.main_image?.data;
  const imageHref = mainImage?.link?.href || "/placeholder.jpg";

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group cursor-pointer border rounded-lg p-4 hover:shadow-lg transition-shadow">
        <div className="relative aspect-square mb-4">
          <Image
            src={imageHref}
            alt={product.attributes.name}
            fill
            className="object-cover rounded-md"
          />
          {hasVariations && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs">
              {variations.length} variations
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
          {product.attributes.name}
        </h3>
        
        {product.attributes.description && (
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {product.attributes.description}
          </p>
        )}
        
        <VariationPrice 
          basePrice={product.attributes.price?.USD || product.attributes.price}
          variations={variations}
        />
        
        {hasVariations && (
          <p className="text-sm text-gray-500 mt-1">
            Available in multiple options
          </p>
        )}
      </div>
    </Link>
  );
}