import yargs, { MiddlewareFunction } from "yargs"
import { CommandContext, CommandHandlerFunction } from "../../types/command"
import { handleErrors } from "../../util/error-handler"
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

export function createGenerateCommand(
  ctx: CommandContext
): yargs.CommandModule<{}, GenerateCommandArguments> {
  return {
    command: "generate",
    aliases: ["g"],
    describe: "generate Elasticpath storefront",
    builder: (yargs) => {
      return yargs
        .middleware(createAuthenticationCheckerMiddleware(ctx))
        .middleware(createActiveStoreMiddleware(ctx))
        .command(createD2CCommand(ctx))
        .option("name", { type: "string", default: null })
        .option("interactive", { type: "boolean", default: true })
        .option("debug", { type: "boolean", default: null })
        .option("dry-run", { type: "boolean", default: false })
        .option("allow-private", { type: "boolean" })
        .option("force", { type: "boolean" })
        .option("list-schematics", { type: "boolean" })
        .option("verbose", { type: "boolean" })
        .option("skip-install", { type: "boolean" })
        .option("skip-git", { type: "boolean" })
        .option("skip-config", { type: "boolean" })
        .help()
        .parserConfiguration({
          "camel-case-expansion": false,
          "dot-notation": false,
          "boolean-negation": true,
          "strip-aliased": true,
        })
    },
    handler: handleErrors(
      trackCommandHandler(ctx, createGenerateCommandHandler)
    ),
  }
}

function argsHasAuthInfo(
  args: yargs.ArgumentsCamelCase<{
    region?: "eu-west" | "us-east"
    username?: string
    password?: string
  }>
): args is yargs.ArgumentsCamelCase<{
  region: "eu-west" | "us-east"
  username: string
  password: string
}> {
  return !!args.password && !!args.username && !!args.region
}

export function createAuthenticationCheckerMiddleware(
  ctx: CommandContext
): MiddlewareFunction {
  return async function authenticationMiddleware(
    args: yargs.ArgumentsCamelCase<{
      region?: "eu-west" | "us-east"
      username?: string
      password?: string
    }>
  ) {
    const { store } = ctx

    if (!isAuthenticated(store) && !argsHasAuthInfo(args)) {
      console.log(
        "You must be logged in to run this command: try running `composable-cli login` first"
      )
    }

    return
  }
}

export function createActiveStoreMiddleware(
  ctx: CommandContext
): MiddlewareFunction {
  return async function activeStoreMiddleware(argv: any) {
    const { store } = ctx

    if (hasActiveStore(store)) {
      return
    }

    return handleErrors(createSetStoreCommandHandler(ctx))(argv)
  }
}

export function createGenerateCommandHandler(
  _ctx: CommandContext
): CommandHandlerFunction<
  GenerateCommandData,
  GenerateCommandError,
  GenerateCommandArguments
> {
  return async function generateCommandHandler(_args) {
    console.log(
      'missing positional argument did you mean to run "d2c" command?'
    )
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
