import yargs from "yargs"
import {
  CommandContext,
  CommandHandlerFunction,
  RootCommandArguments,
} from "../../types/command"
import {
  FeedbackCommandArguments,
  FeedbackCommandData,
  FeedbackCommandError,
} from "./feedback.types"
import open from "open"
import { trackCommandHandler } from "../../util/track-command-handler"
import { isTTY } from "../../util/is-tty"
import { renderInfo } from "../ui"
import { outputContent, outputToken } from "../output"
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
      await open("https://forms.gle/GvdPgeWB52Qx7r2J7")
    }

    renderInfo({
      headline: `🌟 Your Feedback Matters! 🌟`,
      body: outputContent`Simply follow the link to our ${outputToken.link(
        "feedback form",
        "https://forms.gle/GvdPgeWB52Qx7r2J7",
      )}\n\nThank you for taking the time to provide us with your valuable feedback!\n\nWe greatly appreciate your input, as it helps us shape the future of composable cli.\n\nYour opinion is essential in making our tools better than ever.`
        .value,
    })
    return {
      success: true,
      data: {},
    }
  }
}
