import yargs from "yargs"
import {
  CommandContext,
  CommandHandlerFunction,
  RootCommandArguments,
} from "../../types/command"
import {
  InsightsCommandArguments,
  InsightsCommandData,
  InsightsCommandError,
} from "./insights.types"
import { optInsights } from "../../util/has-opted-insights"
import { trackCommandHandler } from "../../util/track-command-handler"
import { isTTY } from "../../util/is-tty"
import Conf from "conf"
import { renderInfo, renderSuccess } from "../ui"
import { outputContent } from "../output"
import inquirer from "inquirer"

export function createInsightsCommand(
  ctx: CommandContext,
): yargs.CommandModule<RootCommandArguments, InsightsCommandArguments> {
  return {
    command: "insights",
    describe: "opt in/out product insights",
    builder: (yargs) => {
      return yargs
        .option("opt-in", {
          alias: "o",
          describe: "opt in to product insights",
          type: "boolean",
        })
        .help()
    },
    handler: ctx.handleErrors(
      trackCommandHandler(ctx, createInsightsCommandHandler),
    ),
  }
}

export function createInsightsCommandHandler(
  ctx: CommandContext,
): CommandHandlerFunction<
  InsightsCommandData,
  InsightsCommandError,
  InsightsCommandArguments
> {
  return async function insightsCommandHandler(args) {
    if (!args.interactive || !isTTY()) {
      console.warn("When not interactive, the opt-in flag must be provided.")
      return {
        success: false,
        error: {
          code: "not-interactive",
          message: "When not interactive, the opt-in flag must be provided.",
        },
      }
    }

    if (args.optIn === undefined) {
      await promptOptInProductInsights(ctx.store)
      return {
        success: true,
        data: {},
      }
    }

    optInsights(ctx.store, args.optIn)
    return {
      success: true,
      data: {},
    }
  }
}

const optInQuestion: inquirer.QuestionCollection = [
  {
    type: "confirm",
    name: "optIn",
    message: `To help us improve, would you like to opt-in to error tracking?`,
    default: true,
  },
]

export async function promptOptInProductInsights(store: Conf): Promise<void> {
  renderInfo({
    body: outputContent`This is a new tool. If you opt-in you will help us improve user experience.

Your data will be used solely for improving our tools and user experiences and will always be kept private.`
      .value,
    customSections: [
      {
        title: "When you opt-in, we'll collect:\n",
        body: {
          list: {
            items: [
              ["Commands you run with composable cli"],
              ["Error messages"],
            ],
          },
        },
      },
    ],
  })
  const answers = await inquirer.prompt(optInQuestion)

  if (answers.optIn) {
    renderSuccess({
      body: "Thank you for opting in. Your data will be kept private.",
    })
  } else {
    renderSuccess({
      body: "You have chosen not to opt-in. No data will be collected.",
    })
  }

  optInsights(store, answers.optIn)
}
