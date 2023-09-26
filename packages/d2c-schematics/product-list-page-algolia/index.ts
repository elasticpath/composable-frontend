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
  const {
    algoliaApplicationId = "",
    algoliaSearchOnlyApiKey = "",
    algoliaIndexName,
    skipTests,
  } = options

  const envVars = {
    [ALGOLIA_API_KEY]: algoliaSearchOnlyApiKey,
    [ALGOLIA_APP_ID]: algoliaApplicationId,
    ...(algoliaIndexName ? { [ALGOLIA_INDEX_NAME]: algoliaIndexName } : {}),
  }

  return chain([
    addEnvVariables(envVars),
    skipTests ? noop() : addEnvVariables(envVars, "/.env.test"),
    ...ALGOLIA_DEPENDENCIES.map((name) =>
      addDependency(name, latestVersions[name], {
        type: "dependencies",
        packageJsonPath: options.path
          ? `${options.path}/package.json`
          : "/package.json",
        existing: "skip",
        install: "none",
      }),
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
      MergeStrategy.Overwrite,
    ),
  ])
}
