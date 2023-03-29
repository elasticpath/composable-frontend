import {
  MergeStrategy,
  Rule,
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  strings,
  url,
  noop,
  filter,
  schematic,
} from "@angular-devkit/schematics"
import type { PlpType, Schema as ProductListOptions } from "./schema"
import type { Schema as AlgoliaProductListOptions } from "../product-list-page-algolia/schema"

type SupportedPlpSchematics = "algolia-plp" | "none"

export default function (options: ProductListOptions): Rule {
  const plpType = resolvePlpType(options.plpType)

  const {
    epccEndpointUrl,
    epccClientId,
    epccClientSecret,
    skipTests,
    path,
    algoliaAdminApiKey,
    algoliaSearchOnlyApiKey,
    algoliaApplicationId,
    directory,
    skipConfig,
  } = options

  const algoliaPlpOptions: AlgoliaProductListOptions = {
    epccEndpointUrl,
    epccClientId,
    epccClientSecret,
    algoliaApplicationId,
    algoliaAdminApiKey,
    algoliaSearchOnlyApiKey,
    skipTests,
    skipConfig,
    path,
    directory,
  }

  return plpType === "none"
    ? noop()
    : chain([
        mergeWith(
          apply(url("./files"), [
            options.skipTests
              ? filter((path) => !path.endsWith(".spec.ts.template"))
              : noop(),
            applyTemplates({
              utils: strings,
              ...options,
            }),
            move(options.path || ""),
          ]),
          MergeStrategy.Overwrite
        ),
        schematic(plpType, algoliaPlpOptions),
      ])
}

function resolvePlpType(type?: PlpType): SupportedPlpSchematics {
  switch (type) {
    case "Algolia":
      return "algolia-plp"
    case "None":
      return "none"
    default:
      return "none"
  }
}
