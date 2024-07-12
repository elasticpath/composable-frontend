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

type SupportedPlpSchematics = "algolia-plp" | "klevu-plp" | "simple-plp"

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
    algoliaIndexName,
    klevuApiKey,
    klevuSearchURL
  } = options

  const plpOptions: typeof options & {
    algoliaIndexName?: string
  } = {
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
    algoliaIndexName,
    klevuApiKey,
    klevuSearchURL
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
      MergeStrategy.Overwrite,
    ),
    schematic(plpType, plpOptions),
  ])
}

function resolvePlpType(type?: PlpType): SupportedPlpSchematics {
  switch (type) {
    case "Algolia":
      return "algolia-plp"
    case "Klevu":
      return "klevu-plp"
    case "Simple":
      return "simple-plp"
    default:
      return "simple-plp"
  }
}
