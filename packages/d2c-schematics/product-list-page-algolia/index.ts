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
  Tree,
  SchematicContext,
} from "@angular-devkit/schematics"
import { Schema as AlgoliaProductListOptions } from "./schema"
import { addDependency } from "../utility"
import { latestVersions } from "../utility/latest-versions"
import { addEnvVariables } from "../utility/add-env-variable"
import { RunSchematicTask } from "@angular-devkit/schematics/tasks"

export const ALGOLIA_DEPENDENCIES = [
  "algoliasearch",
  "@algolia/react-instantsearch-widget-color-refinement-list",
  "react-instantsearch-hooks-server",
  "react-instantsearch-hooks-web",
] as const

export const ALGOLIA_APP_ID = "NEXT_PUBLIC_ALGOLIA_APP_ID"
export const ALGOLIA_API_KEY = "NEXT_PUBLIC_ALGOLIA_API_KEY"

export default function (options: AlgoliaProductListOptions): Rule {
  const {
    algoliaApplicationId = "",
    algoliaSearchOnlyApiKey = "",
    algoliaAdminApiKey = "",
    epccClientSecret,
    epccClientId,
    epccEndpointUrl,
  } = options

  return chain([
    addEnvVariables({
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
    (host: Tree, context: SchematicContext) => {
      if (!options.skipConfig) {
        context.addTask(
          new RunSchematicTask("setup-integration", {
            integrationName: "algolia",
            epccConfig: {
              host: epccEndpointUrl,
              clientId: epccClientId,
              clientSecret: epccClientSecret,
            },
            appId: algoliaApplicationId,
            adminApiKey: algoliaAdminApiKey,
            name: "algolia",
            directory: options.directory,
          })
        )
      }
    },
  ])
}
