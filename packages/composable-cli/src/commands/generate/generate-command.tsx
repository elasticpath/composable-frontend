import yargs, { MiddlewareFunction } from "yargs"
import {
  CommandContext,
  CommandHandlerFunction,
  RootCommandArguments,
} from "../../types/command"
import {
  GenerateCommandArguments,
  GenerateCommandData,
  GenerateCommandError,
} from "./generate.types"
import { createD2CCommand } from "./d2c/d2c-command"
import { hasActiveStore } from "../../util/active-store"
import { createSetStoreCommandHandler } from "../store/store-command"
import { isAuthenticated } from "../../util/check-authenticated"
import { trackCommandHandler } from "../../util/track-command-handler"
import { isTTY } from "../../util/is-tty"
import { SetStoreCommandArguments } from "../store/store.types"
import { renderInfo } from "../ui"

export function createGenerateCommand(
  ctx: CommandContext,
): yargs.CommandModule<RootCommandArguments, GenerateCommandArguments> {
  return {
    command: "generate",
    aliases: ["g"],
    describe: "generate Elastic Path storefront",
    builder: (yargs) => {
      return yargs
        .option("debug", {
          type: "boolean",
          default: null,
          describe:
            "Debug mode. This is true by default if the collection is a relative path (in that case, turn off with --debug=false).",
        })
        .option("dry-run", {
          type: "boolean",
          default: false,
          describe:
            "Do not output anything, but instead just show what actions would be performed. Default to true if debug is also true.",
        })
        .option("allow-private", {
          type: "boolean",
          describe:
            "Allow private schematics to be run from the command line. Default to false.",
        })
        .option("force", {
          type: "boolean",
          describe: "Force overwriting files that would otherwise be an error.",
        })
        .option("list-schematics", {
          type: "boolean",
          describe:
            "List all schematics from the collection, by name. A collection name should be suffixed by a colon. Example: '@elasticpath/d2c-schematics:'.",
        })
        .option("skip-install", { type: "boolean" })
        .option("skip-git", { type: "boolean" })
        .option("skip-config", { type: "boolean" })
        .command(createD2CCommand(ctx))
        .help()
        .parserConfiguration({
          "camel-case-expansion": false,
          "dot-notation": false,
          "boolean-negation": true,
          "strip-aliased": true,
        })
        .strict()
    },
    handler: ctx.handleErrors(
      trackCommandHandler(ctx, createGenerateCommandHandler),
    ),
  }
}

function argsHasAuthInfo(
  args: yargs.ArgumentsCamelCase<{
    region?: "eu-west" | "us-east"
    username?: string
    password?: string
  }>,
): args is yargs.ArgumentsCamelCase<{
  region: "eu-west" | "us-east"
  username: string
  password: string
}> {
  return !!args.password && !!args.username && !!args.region
}

export function createAuthenticationCheckerMiddleware(
  ctx: CommandContext,
): MiddlewareFunction {
  return async function authenticationMiddleware(
    args: yargs.ArgumentsCamelCase<{
      region?: "eu-west" | "us-east"
      username?: string
      password?: string
    }>,
  ) {
    const { store } = ctx

    if (!isAuthenticated(store) && !argsHasAuthInfo(args)) {
      console.warn(
        "You must be logged in to run this command: try running `composable-cli login` first",
      )
    }

    return
  }
}

export function createActiveStoreMiddleware(
  ctx: CommandContext,
): MiddlewareFunction<SetStoreCommandArguments> {
  return async function activeStoreMiddleware(
    args: yargs.ArgumentsCamelCase<SetStoreCommandArguments>,
  ) {
    const { store } = ctx

    if (!args.interactive) {
      return
    }

    if (hasActiveStore(store) || !isTTY()) {
      const activeStore = ctx.store.get("store") as Record<string, string>
      renderInfo({
        body: `Using store: ${activeStore?.name} - ${activeStore?.id}`,
      })
      return
    }

    return ctx.handleErrors(createSetStoreCommandHandler(ctx))(args)
  }
}

export function createGenerateCommandHandler(
  _ctx: CommandContext,
): CommandHandlerFunction<
  GenerateCommandData,
  GenerateCommandError,
  GenerateCommandArguments
> {
  return async function generateCommandHandler(_args) {
    return {
      success: false,
      error: {
        code: "missing-positional-argument",
        message:
          'missing positional argument did you mean to run "d2c" command?',
      },
    }
  }
}
