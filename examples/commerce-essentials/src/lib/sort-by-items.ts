import { KlevuSearchSorting } from "@klevu/core";

export const sortByItems = [
  { label: "Featured", value: undefined },
  {
    label: "Price (Low to High)",
    value: KlevuSearchSorting.PriceAsc,
  },
  {
    label: "Price (High to Low)",
    value: KlevuSearchSorting.PriceDesc,
  },
];
