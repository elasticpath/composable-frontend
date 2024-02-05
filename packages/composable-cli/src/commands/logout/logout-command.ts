import yargs from "yargs"
import { CommandContext, CommandHandlerFunction } from "../../types/command"
import {
  LogoutCommandArguments,
  LogoutCommandData,
  LogoutCommandError,
} from "./logout.types"
import { isAuthenticated } from "../../util/check-authenticated"
import { handleClearCredentials } from "../../util/conf-store/store-credentials"
import { trackCommandHandler } from "../../util/track-command-handler"
import { renderInfo, renderSuccess } from "../ui"
import { outputContent, outputToken } from "../output"

export function createLogoutCommand(
  ctx: CommandContext,
): yargs.CommandModule<{}, LogoutCommandArguments> {
  return {
    command: "logout",
    describe: "Logout of the Composable CLI",
    handler: ctx.handleErrors(
      trackCommandHandler(ctx, createLogoutCommandHandler),
    ),
  }
}

export function createLogoutCommandHandler(
  ctx: CommandContext,
): CommandHandlerFunction<
  LogoutCommandData,
  LogoutCommandError,
  LogoutCommandArguments
> {
  const { store } = ctx

  return async function logoutCommandHandler(_args) {
    if (isAuthenticated(store)) {
      handleClearCredentials(store)
      renderSuccess({
        headline: "Successfully logged out of Elastic Path composable cli",
        body: outputContent`We value your feedback! Please let us know about your experience by using the feedback command ${outputToken.genericShellCommand(
          "ep feedback",
        )}.`.value,
      })
    } else {
      renderInfo({
        body: outputContent`You are not currently logged in. To login, use the ${outputToken.genericShellCommand(
          "ep login",
        )} command.`.value,
      })
    }

    return {
      success: true,
      data: {},
    }
  }
}
