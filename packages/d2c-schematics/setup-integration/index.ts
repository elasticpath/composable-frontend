import {
  apply,
  chain,
  filter,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Tree,
  url,
} from "@angular-devkit/schematics"
import { Schema as SetupIntegrationOptions } from "./schema"
import { setupAlgoliaIntegration } from "../utility/integration-hub/setup-algolia-integration"
import { algoliaIntegrationSettingsSchema } from "@elasticpath/mason-common"
import { addEnvVariables } from "../utility/add-env-variable"
import * as path from "path"

export default function (options: SetupIntegrationOptions): Rule {
  return async (host: Tree, _context: SchematicContext): Promise<Rule> => {
    console.log("options: ", options)
    console.log("host passed to setup integration schematic: ", host)
    switch (options.integrationName) {
      case "algolia":
        return performAlgoliaIntegrationSetup(options, host)
      default:
        return Promise.reject(
          `Failed to setup integration, unsupported integration name: ${options.integrationName}`
        )
    }
  }
}

export const ALGOLIA_INDEX_NAME = "NEXT_PUBLIC_ALGOLIA_INDEX_NAME"

async function performAlgoliaIntegrationSetup(
  options: SetupIntegrationOptions,
  _host: Tree
): Promise<Rule> {
  const parsedOptionsResult =
    algoliaIntegrationSettingsSchema.safeParse(options)

  if (!parsedOptionsResult.success) {
    return Promise.reject(parsedOptionsResult.error)
  }

  const parsedOptions = parsedOptionsResult.data

  const result = await setupAlgoliaIntegration(parsedOptions)

  // TODO perform logic to report the status of the configuration to the user and including success and failure states

  // TODO work out the actual index name when we configure integration hub Algolia
  const algoliaIndexName = ""

  const directoryPath = path.join(process.cwd(), options.directory)

  return chain([
    mergeWith(
      apply(url(directoryPath), [
        filter((path) => path === "/.env.local"),
        addEnvVariables({
          [ALGOLIA_INDEX_NAME]: algoliaIndexName,
        }),
        move(options.directory),
      ]),
      MergeStrategy.Overwrite
    ),
  ])
}
