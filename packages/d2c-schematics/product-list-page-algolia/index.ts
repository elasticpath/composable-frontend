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
} from "@angular-devkit/schematics"
import { Schema as AlgoliaProductListOptions } from "./schema"
import { addDependency } from "../utility"
import { latestVersions } from "../utility/latest-versions"
import { addEnvVariables } from "../utility/add-env-variable"

export const ALGOLIA_DEPENDENCIES = [
  "algoliasearch",
  "@algolia/react-instantsearch-widget-color-refinement-list",
  "react-instantsearch-hooks-server",
  "react-instantsearch-hooks-web",
] as const

export const ALGOLIA_APP_ID = "NEXT_PUBLIC_ALGOLIA_APP_ID"
export const ALGOLIA_API_KEY = "NEXT_PUBLIC_ALGOLIA_API_KEY"
export const ALGOLIA_INDEX_NAME = "NEXT_PUBLIC_ALGOLIA_INDEX_NAME"

export default function (options: AlgoliaProductListOptions): Rule {
  const { algoliaApplicationId = "", algoliaSearchOnlyApiKey = "" } = options

  // TODO work out the actual index name when we configure integration hub Algolia
  const algoliaIndexName = "abc123"

  return chain([
    addEnvVariables({
      [ALGOLIA_INDEX_NAME]: algoliaIndexName,
      [ALGOLIA_API_KEY]: algoliaSearchOnlyApiKey,
      [ALGOLIA_APP_ID]: algoliaApplicationId,
    }),
    ...ALGOLIA_DEPENDENCIES.map((name) =>
      addDependency(name, latestVersions[name], {
        type: "dependencies",
        packageJsonPath: options.path
          ? `${options.path}/package.json`
          : "/package.json",
        existing: "skip",
      })
    ),
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
  ])
}
