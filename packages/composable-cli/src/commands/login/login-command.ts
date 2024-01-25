import yargs, { MiddlewareFunction } from "yargs"
import inquirer from "inquirer"
import Conf from "conf"
import ora from "ora"
import { checkIsErrorResponse } from "../../util/epcc-error"
import { epccUserProfile } from "../../util/epcc-user-profile"
import {
  CommandContext,
  CommandHandlerFunction,
  RootCommandArguments,
} from "../../types/command"
import {
  LoginCommandArguments,
  LoginCommandData,
  LoginCommandError,
} from "./login.types"
import { authenticateGrantTypePassword } from "./epcc-authenticate"
import {
  handleClearCredentials,
  storeCredentials,
  storeUserProfile,
} from "../../util/conf-store/store-credentials"
import { isAuthenticated } from "../../util/check-authenticated"
import { trackCommandHandler } from "../../util/track-command-handler"
import { EpccRequester } from "../../util/command"
import { credentialsSchema } from "../../lib/authentication/credentials-schema"
import { welcomeNote } from "../ui/alert"
import { outputContent, outputToken } from "../output"

/**
 * Region prompts
 */
const regionPrompts = {
  type: "list",
  name: "region",
  message: "What region do you want to authenticated with?",
  choices: [
    { name: "us-east (free trial users)", value: "us-east" },
    { name: "eu-west", value: "eu-west" },
  ] as const,
  default: "us-east",
} as const

function handleRegionUpdate(store: Conf, region: "eu-west" | "us-east"): void {
  store.set("region", region)
}

export function createLoginCommand(
  ctx: CommandContext,
): yargs.CommandModule<RootCommandArguments, LoginCommandArguments> {
  return {
    command: "login",
    describe: "Login to the Composable CLI",
    builder: (yargs) => {
      return yargs
        .option("region", {
          alias: "r",
          choices: ["us-east", "eu-west"] as const,
          description: "Region of Elastic Path account",
        })
        .option("username", {
          alias: "u",
          type: "string",
          description: "Username of Elastic Path account",
        })
        .option("password", {
          alias: "p",
          type: "string",
          description: "Password of Elastic Path account",
        })
        .example("$0 login", "using interactive prompts")
        .example(
          "$0 login --region=us-east --username=john.doe@example.com --password=topSecret",
          "using command line arguments",
        )
        .fail(false)
        .help()
        .parserConfiguration({
          "strip-aliased": true,
        })
    },
    handler: ctx.handleErrors(
      trackCommandHandler(ctx, createLoginCommandHandler),
    ),
  }
}

export function createAuthenticationMiddleware(
  ctx: CommandContext,
): MiddlewareFunction<LoginCommandArguments> {
  return async function authenticationMiddleware(
    args: yargs.ArgumentsCamelCase<LoginCommandArguments>,
  ) {
    const { store } = ctx

    const isAuthCommand = args._.some(
      (arg) => arg === "login" || arg === "logout",
    )

    if (isAuthenticated(store) || !args.interactive || isAuthCommand) {
      return
    }

    return ctx.handleErrors(
      trackCommandHandler(ctx, createLoginCommandHandler),
    )(args)
  }
}

export function createLoginCommandHandler(
  ctx: CommandContext,
): CommandHandlerFunction<
  LoginCommandData,
  LoginCommandError,
  LoginCommandArguments
> {
  const { store, logger } = ctx

  return async function loginCommandHandler(args) {
    const regionAnswers = await inquirer.prompt(regionPrompts, {
      ...(args.region ? { region: args.region } : {}),
    })

    handleClearCredentials(store)

    if (regionAnswers.region) {
      handleRegionUpdate(store, regionAnswers.region)
    }

    const { username, password } = await promptUsernamePasswordLogin(args)

    const spinner = ora("Authenticating").start()

    const result = await authenticateUserPassword(
      store,
      ctx.requester,
      username,
      password,
    )

    if (!result.success) {
      spinner.fail("Failed to authenticate")
      logger.error("There was a problem logging you in.")
      logger.error(`${result.name}`)
      logger.error(result.message)
      return {
        success: false,
        error: {
          code: "authentication-failure",
          message: "Failed to authenticate",
        },
      }
    }

    spinner.text = "Fetching your profile"

    const userProfileResponse = await epccUserProfile(
      ctx.requester,
      (result as any).data?.access_token,
    )

    if (!userProfileResponse.success) {
      spinner.warn("Successfully authenticated but failed to load user profile")
      console.warn(
        "Their was a problem loading your user profile.",
        userProfileResponse.error.code,
        userProfileResponse.error.message,
      )
      return {
        success: true,
        data: {},
      }
    }

    storeUserProfile(store, userProfileResponse.data.data)

    spinner.succeed(
      `Successfully authenticated as ${userProfileResponse.data.data.email}`,
    )

    welcomeNote({
      type: "success",
      headline: outputContent`${outputToken.subheading(
        `${userProfileResponse.data.data.name} welcome to Elastic Path composable cli`,
      )}`.value,
      body: "A CLI for managing your Elastic Path powered storefront. To get support or ask any question, join us in our slack community.",
      customSections: [
        {
          title: "Help\n",
          body: {
            list: {
              items: [
                {
                  link: {
                    label: "Slack Community",
                    url: "https://elasticpathcommunity.slack.com/join/shared_invite/zt-1upzq3nlc-O3sy1bT0UJYcOWEQQCtnqw",
                  },
                },
              ],
            },
          },
        },
      ],
    })

    return {
      success: true,
      data: {},
    }
  }
}

async function authenticateUserPassword(
  store: Conf,
  requester: EpccRequester,
  username: string,
  password: string,
): Promise<
  | { success: true; data: unknown }
  | {
      success: false
      code: "authentication-failure"
      name: string
      message: string
    }
> {
  try {
    const credentialsResp = await authenticateGrantTypePassword(
      requester,
      username,
      password,
    )

    const parsedCredentialsResp = credentialsSchema.safeParse(credentialsResp)

    if (!parsedCredentialsResp.success) {
      return {
        success: false,
        code: "authentication-failure",
        name: "data parsing error",
        message: parsedCredentialsResp.error.message,
      }
    }

    if (checkIsErrorResponse(parsedCredentialsResp.data)) {
      return {
        success: false,
        code: "authentication-failure",
        name: "epcc error",
        message: parsedCredentialsResp.data.errors.toString(),
      }
    }

    storeCredentials(store, parsedCredentialsResp.data)

    return {
      success: true,
      data: credentialsResp,
    }
  } catch (e) {
    const { name, message } =
      e instanceof Error
        ? { name: e.name, message: e.message }
        : { name: "UnknownError", message: "An unknown error occurred" }
    return {
      success: false,
      code: "authentication-failure",
      name,
      message,
    }
  }
}

async function promptUsernamePasswordLogin(
  args: LoginCommandArguments,
): Promise<{
  username: string
  password: string
}> {
  return inquirer.prompt(
    [
      {
        type: "string",
        message: "Enter your username",
        name: "username",
      },
      {
        type: "password",
        message: "Enter your password",
        name: "password",
        mask: "*",
      },
    ],
    {
      ...(args.username ? { username: args.username } : {}),
      ...(args.password ? { password: args.password } : {}),
    },
  )
}
