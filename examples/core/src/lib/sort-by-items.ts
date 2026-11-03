import { INDEX_NAME } from "./instantsearch-routing"

export type SortByItem = {
  label: string
  value: string
}

export function buildSortByItems(currencyCode: string): SortByItem[] {
  const priceField = `price.${currencyCode}.float_price`

  return [
    { label: "Relevance", value: INDEX_NAME },
    {
      label: "Price (Low to High)",
      value: `${INDEX_NAME}/sort/${priceField}:asc`,
    },
    {
      label: "Price (High to Low)",
      value: `${INDEX_NAME}/sort/${priceField}:desc`,
    },
  ]
}
