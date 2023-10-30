import { algoliaEnvData } from "./resolve-algolia-env";

export const sortByItems = [
  { label: "Featured", value: algoliaEnvData.indexName },
  {
    label: "Price (Low to High)",
    value: `${algoliaEnvData.indexName}_price_asc`,
  },
  {
    label: "Price (High to Low)",
    value: `${algoliaEnvData.indexName}_price_desc`,
  },
];
