import type { FormattedPrice, Product } from "@epcc-sdk/sdks-shopper"

interface VariationPriceProps {
  basePrice?: FormattedPrice
  variations?: Product[]
  selectedVariation?: Product
}

type ComparablePrice = FormattedPrice & { amount: number; formatted: string }

function displayPrice(product: Product): FormattedPrice | undefined {
  return product.meta?.display_price?.without_tax
}

function isComparable(price: FormattedPrice | undefined): price is ComparablePrice {
  return price?.amount !== undefined && price.formatted !== undefined
}

function PriceText({ children }: { children: string }) {
  return <div className="text-2xl font-bold">{children}</div>
}

export default function VariationPrice({
  basePrice,
  variations,
  selectedVariation,
}: VariationPriceProps) {
  const selectedPrice = selectedVariation && displayPrice(selectedVariation)
  if (selectedPrice?.formatted) {
    return <PriceText>{selectedPrice.formatted}</PriceText>
  }

  const variationPrices = (variations ?? [])
    .map(displayPrice)
    .filter(isComparable)
    .sort((a, b) => a.amount - b.amount)

  if (variationPrices.length > 0) {
    const lowest = variationPrices[0]
    const highest = variationPrices[variationPrices.length - 1]

    return (
      <PriceText>
        {lowest.amount === highest.amount
          ? lowest.formatted
          : `${lowest.formatted} - ${highest.formatted}`}
      </PriceText>
    )
  }

  if (basePrice?.formatted) {
    return <PriceText>{basePrice.formatted}</PriceText>
  }

  return <PriceText>Price unavailable</PriceText>
}
