import yargs from "yargs"
import {
  AlgoliaIntegrationCommandArguments,
  AlgoliaIntegrationCommandData, AlgoliaIntegrationCommandError,
} from "./algolia-integration.types"
import {
  CommandContext,
  CommandHandlerFunction,
} from "../../../types/command"
import { handleErrors } from "../../../util/error-handler"
import { trackCommandHandler } from "../../../util/track-command-handler"
import { createActiveStoreMiddleware, createAuthenticationCheckerMiddleware } from "../../generate/generate-command"
import { IntegrationCommandArguments } from "../integration.types"
import { createConsoleLogger } from "@angular-devkit/core/node"
import * as ansiColors from "ansi-colors"
import { setupAlgoliaIntegration } from "./utility/integration-hub/setup-algolia-integration"

export function createAlgoliaIntegrationCommand(
  ctx: CommandContext
): yargs.CommandModule<IntegrationCommandArguments, AlgoliaIntegrationCommandArguments> {
  return {
    command: "algolia",
    describe: "setup Algolia integration for your Elastic Path powered storefront",
    builder: async (yargs) => {
      return yargs
        .middleware(createAuthenticationCheckerMiddleware(ctx))
        .middleware(createActiveStoreMiddleware(ctx))
        .help()
    },
    handler: handleErrors(trackCommandHandler(ctx, createAlgoliaIntegrationCommandHandler)),
  }
}

export function createAlgoliaIntegrationCommandHandler(
  ctx: CommandContext
): CommandHandlerFunction<
  AlgoliaIntegrationCommandData,
  AlgoliaIntegrationCommandError,
  AlgoliaIntegrationCommandArguments
> {
  return async function generateCommandHandler(args) {
    console.log('called algolia integration command handler')
    const colors = ansiColors.create()
    const logger = createConsoleLogger(
      !!args.verbose,
      ctx.stdout,
      ctx.stderr,
      {
        info: (s) => s,
        debug: (s) => s,
        warn: (s) => colors.bold.yellow(s),
        error: (s) => colors.bold.red(s),
        fatal: (s) => colors.bold.red(s),
      }
    )

    // TODO pull values from .env.local if they exist on the project otherwise prompt for them using inquirer

    const result = await setupAlgoliaIntegration({
      appId: "S9E0EXEEMT",
      adminApiKey: "3903e5b444e4a0f16e04ad0651f03c38",
      epccConfig: {
        host: "api.moltin.com",
        clientId: "mvhffrH78nYzaH8D3w8VaBjyTYSHEknZTWwwZOiqhR",
        clientSecret: "1M7SGrJMzXnBqNiXoHaKQeNfoGLxCrEZGCnTJlwniX",
      },
    }, logger)

    console.log('result', result)

    if (!result.success) {
      console.error('failed to setup algolia integration: ', result)
      return {
        success: false,
        error: {
          code: "ALGOLIA_INTEGRATION_SETUP_FAILED",
          message: "Failed to setup Algolia integration",
        }
      }
    }

    return {
      success: true,
      data: {}
    }
  }
}
