import {
  apply,
  chain,
  filter,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  url,
} from "@angular-devkit/schematics"
import { logging } from "@angular-devkit/core"
import { AlgoliaIntegrationSettings } from "@elasticpath/composable-common"
import { setupAlgoliaIntegration } from "./setup-algolia-integration"
import { formatAlgoliaIntegrationResponse } from "./format-algolia-integration-response"
import path from "path"
import { addEnvVariables } from "../add-env-variable"
import ora from "ora"

export const ALGOLIA_INDEX_NAME = "NEXT_PUBLIC_ALGOLIA_INDEX_NAME"

export async function performAlgoliaIntegrationSetup(
  directory: string,
  options: AlgoliaIntegrationSettings,
  logger: logging.LoggerApi
): Promise<Rule> {
  const spinner = ora({
    text: `Running Algolia integration setup...`,
    discardStdin: process.platform != "win32",
  }).start()

  const parsedOptions = options

  const result = await setupAlgoliaIntegration(parsedOptions, logger)

  if (!result.success) {
    logger.error(formatAlgoliaIntegrationResponse(result))
    spinner.fail(formatAlgoliaIntegrationResponse(result))
    return Promise.reject(result)
  }

  // TODO work out the actual index name when we configure integration hub Algolia
  const algoliaIndexName = ""

  const directoryPath = path.join(process.cwd(), directory)

  spinner.succeed(formatAlgoliaIntegrationResponse(result))
  spinner.stop()
  return chain([
    mergeWith(
      apply(url(directoryPath), [
        filter((path) => path === "/.env.local"),
        addEnvVariables({
          [ALGOLIA_INDEX_NAME]: algoliaIndexName,
        }),
        move(directory),
      ]),
      MergeStrategy.Overwrite
    ),
  ])
}
