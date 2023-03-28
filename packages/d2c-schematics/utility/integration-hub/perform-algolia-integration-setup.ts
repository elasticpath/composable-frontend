import { Schema as SetupIntegrationOptions } from "../../../../dist-schema/packages/d2c-schematics/setup-integration/schema"
import {
  apply,
  chain,
  filter,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  Tree,
  url,
} from "@angular-devkit/schematics"
import { logging } from "@angular-devkit/core"
import { algoliaIntegrationSettingsSchema } from "@elasticpath/mason-common"
import { setupAlgoliaIntegration } from "./setup-algolia-integration"
import { formatAlgoliaIntegrationResponse } from "./format-algolia-integration-response"
import path from "path"
import { addEnvVariables } from "../add-env-variable"
import ora from "ora"

export const ALGOLIA_INDEX_NAME = "NEXT_PUBLIC_ALGOLIA_INDEX_NAME"

export async function performAlgoliaIntegrationSetup(
  options: SetupIntegrationOptions,
  _host: Tree,
  logger: logging.LoggerApi
): Promise<Rule> {
  const spinner = ora({
    text: `Running Algolia integration setup...`,
    discardStdin: process.platform != "win32",
  }).start()

  const parsedOptionsResult =
    algoliaIntegrationSettingsSchema.safeParse(options)

  if (!parsedOptionsResult.success) {
    spinner.fail()
    return Promise.reject(parsedOptionsResult.error)
  }

  const parsedOptions = parsedOptionsResult.data

  const result = await setupAlgoliaIntegration(parsedOptions, logger)

  if (!result.success) {
    logger.error(formatAlgoliaIntegrationResponse(result))
    spinner.fail(formatAlgoliaIntegrationResponse(result))
    return Promise.reject(result)
  }

  // TODO work out the actual index name when we configure integration hub Algolia
  const algoliaIndexName = ""

  const directoryPath = path.join(process.cwd(), options.directory)

  spinner.succeed(formatAlgoliaIntegrationResponse(result))
  spinner.stop()
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
