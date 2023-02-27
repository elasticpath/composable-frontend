import {
  MergeStrategy,
  Rule,
  Tree,
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
  source,
} from "@angular-devkit/schematics"
import type { PlpType, Schema as ProductListOptions } from "./schema"
import type { Schema as AlgoliaProductListOptions } from "../product-list-page-algolia/schema"
import { addDependency } from "../utility"
import { latestVersions } from "../utility/latest-versions"

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
  } = options

  const algoliaPlpOptions: AlgoliaProductListOptions = {
    epccEndpointUrl,
    epccClientId,
    epccClientSecret,
    algoliaApplicationId,
    algoliaAdminApiKey,
    algoliaSearchOnlyApiKey,
    skipTests,
    path,
  }

  return chain([
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
    plpType === "none" ? noop() : schematic(plpType, algoliaPlpOptions),
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
