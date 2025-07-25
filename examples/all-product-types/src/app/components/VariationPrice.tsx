interface VariationPriceProps {
  basePrice?: {
    amount: number;
    currency: string;
  };
  variations?: any[];
  selectedVariation?: any;
}

export default function VariationPrice({
  basePrice,
  variations,
  selectedVariation,
}: VariationPriceProps) {
  // If a variation is selected, show its price
  if (selectedVariation && selectedVariation.attributes?.price) {
    const price = selectedVariation.attributes.price.USD || selectedVariation.attributes.price;
    return (
      <div className="text-2xl font-bold">
        ${(price.amount / 100).toFixed(2)}
      </div>
    );
  }

  // If no variation selected but we have variations, show price range
  if (variations && variations.length > 0) {
    const prices = variations
      .map(v => v.attributes?.price?.USD?.amount || v.attributes?.price?.amount)
      .filter(Boolean)
      .map(p => p / 100);

    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      if (minPrice === maxPrice) {
        return (
          <div className="text-2xl font-bold">
            ${minPrice.toFixed(2)}
          </div>
        );
      }

      return (
        <div className="text-2xl font-bold">
          ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
        </div>
      );
    }
  }

  // Fallback to base price
  if (basePrice) {
    return (
      <div className="text-2xl font-bold">
        ${(basePrice.amount / 100).toFixed(2)}
      </div>
    );
  }

  return <div className="text-2xl font-bold">Price unavailable</div>;
}