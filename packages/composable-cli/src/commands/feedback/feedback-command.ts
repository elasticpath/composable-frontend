import yargs from "yargs"
import { CommandContext, CommandHandlerFunction } from "../../types/command"
import { handleErrors } from "../../util/error-handler"
import { renderInk } from "../../lib/ink/render-ink"
import React from "react"
import {
  FeedbackCommandArguments,
  FeedbackCommandData,
  FeedbackCommandError,
} from "./feedback.types"
import open from "open"
import { Feedback } from "../ui/feedback/feedback"
export function createFeedbackCommand(
  ctx: CommandContext
): yargs.CommandModule<{}, FeedbackCommandArguments> {
  return {
    command: "feedback",
    describe: "Feedback to the Composable CLI",
    handler: handleErrors(createFeedbackCommandHandler(ctx)),
  }
}

export function createFeedbackCommandHandler(
  _ctx: CommandContext
): CommandHandlerFunction<
  FeedbackCommandData,
  FeedbackCommandError,
  FeedbackCommandArguments
> {
  return async function feedbackCommandHandler(_args) {
    await open("https://elasticpath.dev/docs")
    await renderInk(React.createElement(Feedback))
    return {
      success: true,
      data: {},
    }
  }
}
