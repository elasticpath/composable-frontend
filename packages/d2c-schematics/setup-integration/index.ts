import { noop, Rule, SchematicContext, Tree } from "@angular-devkit/schematics"
import { Schema as SetupIntegrationOptions } from "./schema"
import { createFallbackLogger } from "../utility/fallback-logger"
import { performAlgoliaIntegrationSetup } from "../utility/integration-hub/perform-algolia-integration-setup"

export default function (options: SetupIntegrationOptions): Rule {
  return async (host: Tree, context: SchematicContext): Promise<Rule> => {
    const logger = context.logger ?? createFallbackLogger()
    try {
      switch (options.integrationName) {
        case "algolia":
          return performAlgoliaIntegrationSetup(options, host, logger)
        default:
          logger.error(
            `Failed to setup integration, unsupported integration name: ${options.integrationName}`
          )
          return noop()
      }
    } catch (err) {
      logger.error(
        `Failed to setup integration, unexpected error occurred: ${
          err instanceof Error
            ? `${err.name} - ${err.message}`
            : "Couldn't process error message"
        }`
      )
      return noop()
    }
  }
}
