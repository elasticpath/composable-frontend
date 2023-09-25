import yargs from "yargs"
import {
  AlgoliaIntegrationCommandArguments,
  AlgoliaIntegrationCommandData, AlgoliaIntegrationCommandError
} from "./algolia-integration.types"
import {
  CommandContext,
  CommandHandlerFunction
} from "../../../types/command"
import { handleErrors } from "../../../util/error-handler"
import { trackCommandHandler } from "../../../util/track-command-handler"
import { createActiveStoreMiddleware, createAuthenticationCheckerMiddleware } from "../../generate/generate-command"
import { IntegrationCommandArguments } from "../integration.types"
import { createConsoleLogger } from "@angular-devkit/core/node"
import * as ansiColors from "ansi-colors"
import { setupAlgoliaIntegration } from "./utility/integration-hub/setup-algolia-integration"
import inquirer from "inquirer"
import { AlgoliaIntegrationSettings } from "@elasticpath/composable-common"

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
        .option("app-id", {
          type: "string",
          description: "Algolia App ID"
        }).option("admin-api-key", {
          type: "string",
          description: "Algolia Admin API Key"
        }).option("host", {
          type: "string",
          description: "Elastic Path Commerce Cloud API Host"
        }).option("client-id", {
          type: "string",
          description: "Elastic Path Commerce Cloud Client ID"
        }).option("client-secret", {
          type: "string",
          description: "Elastic Path Commerce Cloud Client Secret"
        })
        .help()
    },
    handler: handleErrors(trackCommandHandler(ctx, createAlgoliaIntegrationCommandHandler))
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
    console.log("called algolia integration command handler")
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
        fatal: (s) => colors.bold.red(s)
      }
    )

    // TODO pull values from .env.local if they exist on the project otherwise prompt for them using inquirer
    //  - maybe use the active store and create a application key for the integration instead
    //  - prompt for which store if no active store is selected
    const options = await algoliaOptionsPrompts(args)

    /*
    {
      appId: "S9E0EXEEMT",
      adminApiKey: "3903e5b444e4a0f16e04ad0651f03c38",
      epccConfig: {
        host: "api.moltin.com",
        clientId: "mvhffrH78nYzaH8D3w8VaBjyTYSHEknZTWwwZOiqhR",
        clientSecret: "1M7SGrJMzXnBqNiXoHaKQeNfoGLxCrEZGCnTJlwniX",
      },
    }
     */

    const result = await setupAlgoliaIntegration(options, logger)

    if (!result.success) {
      console.error("failed to setup algolia integration: ", result)
      return {
        success: false,
        error: {
          code: "ALGOLIA_INTEGRATION_SETUP_FAILED",
          message: "Failed to setup Algolia integration"
        }
      }
    }

    // TODO: will need to ask the user if they want to publish a catalog so the algolia indexer can take effect
    //  otherwise it will not index anything.
    //  - should fetch the users catalogs
    //  - should ask the user which catalogs they want to publish (multi select)
    //  - should publish selected catalogs

    // TODO: tell the user the name of the published indexes so they can add them to their .env.local file
    //  - indexes are made up of the <catalog-name>_<first-section-uuid> e.g. Default_11ce355f
    //  - example with space in name "Default Catalog" -> Default_Catalog_11ce355f
    //  - check if the user has an .env.local file in the directory they have executed the command from
    //  - better yet prompt the user to ask if they want that done for them.

    // TODO: run additional config like setting up facets and sorting on the algolia indices
    //  - additionalAlgoliaSetup()

    return {
      success: true,
      data: {}
    }
  }
}

async function algoliaOptionsPrompts(args: AlgoliaIntegrationCommandArguments): Promise<Omit<AlgoliaIntegrationSettings, "name">> {
  const { host, clientId, clientSecret, adminApiKey, appId } = args

  const answers = await inquirer.prompt([
    ...(!appId ? [{
      type: "string",
      name: "appId",
      message: "What is your Algolia App ID?"
    }] : []),
    ...(!adminApiKey ? [{
      type: "string",
      name: "adminApiKey",
      message: "What is your Algolia Admin API Key?"
    }] : []),
    ...(!host ? [{
      type: "string",
      name: "host",
      message: "What is your Elastic Path Commerce Cloud API Host?"
    }] : []),
    ...(!clientId ? [{
      type: "string",
      name: "clientId",
      message: "What is your Elastic Path Commerce Cloud Client ID?"
    }] : []),
    ...(!clientSecret ? [{
      type: "string",
      name: "clientSecret",
      message: "What is your Elastic Path Commerce Cloud Client Secret?"
    }] : [])
  ])

  const flatOptions = {
    ...(host ? { host } : {}),
    ...(appId ? { appId } : {}),
    ...(clientId ? { clientId } : {}),
    ...(clientSecret ? { clientSecret } : {}),
    ...(adminApiKey ? { adminApiKey } : {}),
    ...answers
  }

  return {
    appId: flatOptions.appId,
    adminApiKey: flatOptions.adminApiKey,
    epccConfig: {
      host: flatOptions.host,
      clientId: flatOptions.clientId,
      clientSecret: flatOptions.clientSecret
    }
  }
}