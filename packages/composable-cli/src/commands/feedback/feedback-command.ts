import yargs from "yargs"
import {
  CommandContext,
  CommandHandlerFunction,
  RootCommandArguments,
} from "../../types/command"
import { renderInk } from "../../lib/ink/render-ink"
import React from "react"
import {
  FeedbackCommandArguments,
  FeedbackCommandData,
  FeedbackCommandError,
} from "./feedback.types"
import open from "open"
import { Feedback } from "../ui/feedback/feedback"
import { trackCommandHandler } from "../../util/track-command-handler"
import { isTTY } from "../../util/is-tty"
export function createFeedbackCommand(
  ctx: CommandContext,
): yargs.CommandModule<RootCommandArguments, FeedbackCommandArguments> {
  const { handleErrors } = ctx
  return {
    command: "feedback",
    describe: "Feedback to the Composable CLI",
    handler: handleErrors(
      trackCommandHandler(ctx, createFeedbackCommandHandler),
    ),
  }
}

export function createFeedbackCommandHandler(
  _ctx: CommandContext,
): CommandHandlerFunction<
  FeedbackCommandData,
  FeedbackCommandError,
  FeedbackCommandArguments
> {
  return async function feedbackCommandHandler(args) {
    if (args.interactive && isTTY()) {
      await open("https://elasticpath.dev/docs")
    }

    await renderInk(React.createElement(Feedback))
    return {
      success: true,
      data: {},
    }
  }
}
