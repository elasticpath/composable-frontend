import yargs from "yargs"
import { CommandContext, CommandHandlerFunction } from "../../types/command"
import {
  LogoutCommandArguments,
  LogoutCommandData,
  LogoutCommandError,
} from "./logout.types"
import { isAuthenticated } from "../../util/check-authenticated"
import { renderInk } from "../../lib/ink/render-ink"
import React from "react"
import { LogoutNote } from "../ui/logout/logout-note"
import { handleClearCredentials } from "../../util/conf-store/store-credentials"
import { trackCommandHandler } from "../../util/track-command-handler"

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
    }

    await renderInk(React.createElement(LogoutNote))

    return {
      success: true,
      data: {},
    }
  }
}
