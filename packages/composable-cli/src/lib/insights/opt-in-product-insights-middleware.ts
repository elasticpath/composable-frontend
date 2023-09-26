import { CommandContext, RootCommandArguments } from "../../types/command"
import { MiddlewareFunction } from "yargs"
import { isOptedInsights, optInsights } from "../../util/has-opted-insights"
import inquirer from "inquirer"
import Conf from "conf"
import { logging } from "@angular-devkit/core"

const optInQuestion: inquirer.QuestionCollection = [
  {
    type: "confirm",
    name: "optIn",
    message: `
Welcome to Elastic Paths Composable CLI!

This is a new tool. To help us improve, would you like to opt-in to error tracking?

When you opt-in, we'll collect:
- Commands you run with composable cli
- Error messages

Your data will be used solely for improving our tool.

(Your data will be kept private)
`,
    default: true, // You can set the default value to true or false as needed
  },
]

export function createOptInProductInsightsMiddleware(
  ctx: CommandContext,
): MiddlewareFunction<RootCommandArguments> {
  return async function optInProductInsightsMiddleware(
    args: RootCommandArguments,
  ) {
    const { store, logger } = ctx

    if (isOptedInsights(store) || isInsightsCommand(args)) {
      return
    }

    if (!args.interactive) {
      optInsights(store, false)
      return
    }

    await promptOptInProductInsights(store, logger)
    return
  }
}

function isInsightsCommand(argv: any): boolean {
  return argv._[0] === "insights"
}

export async function promptOptInProductInsights(
  store: Conf,
  logger: logging.Logger,
): Promise<void> {
  const answers = await inquirer.prompt(optInQuestion)

  if (answers.optIn) {
    logger.info("Thank you for opting in. Your data will be kept private.")
  } else {
    logger.info(
      "You have chosen not to opt-in. Your privacy will be fully respected.",
    )
  }

  optInsights(store, answers.optIn)
}
