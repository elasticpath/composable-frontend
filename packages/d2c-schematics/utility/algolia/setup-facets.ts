import { Settings } from "@algolia/client-search"

export function configureAlgoliaFacets(sourceSettings: Settings): Settings {
  const { attributesForFaceting } = sourceSettings
  return {
    ...sourceSettings,
    attributesForFaceting: [
      ...(attributesForFaceting ?? []),
      "ep_categories.lvl0",
      "ep_categories.lvl1",
      "ep_categories.lvl2",
      "ep_categories.lvl3",
      "ep_slug_categories.lvl0",
      "ep_slug_categories.lvl1",
      "ep_slug_categories.lvl2",
      "ep_slug_categories.lvl3",
      // TODO this should be updated to handle multi currency depending on how we decide to do that in mason
      "ep_price.USD.float_price",
      /*
      TODO need to decide how we are handling custom spec e.g.
      ep_extensions_products_specifications.color
       */
    ],
  }
}
