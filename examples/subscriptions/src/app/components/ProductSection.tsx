import Link from 'next/link';
import ProductCard from './ProductCard';

interface ProductSectionProps {
  title: string;
  viewAllLink?: string;
  viewAllText?: string;
  showPlaceholder?: boolean;
  products: Array<{
    href: string;
    image: string;
    title: string;
    showPlaceholder?: boolean;
  }>;
}

export default function ProductSection({ 
  title, 
  viewAllLink, 
  viewAllText = "See all cards",
  showPlaceholder = false,
  products 
}: ProductSectionProps) {
  return (
    <section className="max-w-[1200px] mx-auto px-[15px] py-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold tracking-[0.5px]">{title}</h2>
        {viewAllLink && (
          <Link 
            href={viewAllLink}
            className="text-sm text-[#005A86] hover:text-[#003F5F] transition-colors"
          >
            {viewAllText}
          </Link>
        )}
      </div>
      
      <div className="flex flex-wrap gap-x-[15px] gap-y-[20px]">
        {products.map((product, index) => (
          <ProductCard
            key={index}
            href={product.href}
            image={product.image}
            title={product.title}
            showPlaceholder={product.showPlaceholder !== undefined ? product.showPlaceholder : showPlaceholder}
          />
        ))}
      </div>
    </section>
  );
}