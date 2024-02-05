import yargs, { MiddlewareFunction } from "yargs"
import inquirer from "inquirer"
import Conf from "conf"
import {
  checkIsErrorResponse,
  resolveEPCCErrorMessage,
} from "../../util/epcc-error"
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
  getUserProfile,
  handleClearCredentials,
  storeCredentials,
  storeUserProfile,
} from "../../util/conf-store/store-credentials"
import { isAuthenticated } from "../../util/check-authenticated"
import { trackCommandHandler } from "../../util/track-command-handler"
import { EpccRequester } from "../../util/command"
import {
  Credentials,
  credentialsResponseSchema,
} from "../../lib/authentication/credentials-schema"
import { welcomeNote } from "../ui/alert"
import { outputContent, outputToken } from "../output"
import { renderError, renderWarning } from "../ui"
import { Listr } from "listr2"
import { UserProfile } from "../../lib/epcc-user-profile-schema"
import { processUnknownError } from "../../util/process-unknown-error"

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

    const isInsightsCommand = args._.some((arg) => arg === "insights")

    if (
      isAuthenticated(store) ||
      !args.interactive ||
      isAuthCommand ||
      isInsightsCommand
    ) {
      return
    }

    return ctx.handleErrors(
      trackCommandHandler(ctx, createLoginCommandHandler),
    )(args)
  }
}

type LoginTaskContext = {
  username: string
  password: string
  credentials?: Credentials
  profile?: UserProfile
}

export function createLoginCommandHandler(
  ctx: CommandContext,
): CommandHandlerFunction<
  LoginCommandData,
  LoginCommandError,
  LoginCommandArguments
> {
  const { store } = ctx
  const requester = ctx.requester

  return async function loginCommandHandler(args) {
    const alreadyLoggedIn = isAuthenticated(store)
    const profile = getUserProfile(store)

    if (alreadyLoggedIn && profile.success) {
      renderWarning({
        body: outputContent`You are already logged in as ${profile.data.email}`
          .value,
      })
      const { continueLogin } = await inquirer.prompt([
        {
          type: "confirm",
          name: "continueLogin",
          message: "Do you want to continue?",
          default: false,
        },
      ])

      if (!continueLogin) {
        return {
          success: true,
          data: {},
        }
      }
    }

    const regionAnswers = await inquirer.prompt(regionPrompts, {
      ...(args.region ? { region: args.region } : {}),
    })

    const { username, password } = await promptUsernamePasswordLogin(args)

    const loginTask = createLoginTask({
      username,
      password,
      requester,
      store,
      region: regionAnswers.region,
    })

    try {
      const resultCtx = await loginTask.run({ username, password })

      if (!resultCtx.profile) {
        return {
          success: false,
          error: {
            code: "task_failed",
            message:
              "User profile not found on context after login task completion",
          },
        }
      }

      welcomeNote({
        type: "success",
        headline: outputContent`${outputToken.subheading(
          `${resultCtx.profile.name} welcome to Elastic Path Composable CLI`,
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
    } catch (error) {
      return {
        success: false,
        error: {
          code: "task_failed",
          message: processUnknownError(error),
        },
      }
    }
  }
}

function createLoginTask({
  username,
  password,
  requester,
  region,
  store,
}: {
  username: string
  password: string
  region: "eu-west" | "us-east"
  requester: CommandContext["requester"]
  store: Conf
}) {
  return new Listr<LoginTaskContext>(
    [
      {
        title: "Authenticating",
        task: async (_ctx, rootTask) => {
          return rootTask.newListr([
            {
              title: "Authenticating",
              task: async (innerCtx) => {
                const result = await authenticateUserPassword(
                  requester,
                  username,
                  password,
                )

                if (!result.success) {
                  renderError({
                    headline: "Failed to authenticate",
                    body: "There was a problem logging you in. Make sure that your username and password are correct.",
                  })
                  throw new Error("Failed to authenticate")
                }

                innerCtx.credentials = result.data
              },
            },
            {
              title: "Fetching your profile",
              skip: (innerCtx) => !innerCtx.credentials,
              task: async (innerCtx, innerTask) => {
                if (!innerCtx.credentials) {
                  throw new Error(
                    "No credentials found can't complete Fetching your profile task.",
                  )
                }

                const userProfileResponse = await epccUserProfile(
                  requester,
                  innerCtx.credentials.access_token,
                )

                if (!userProfileResponse.success) {
                  renderError({
                    headline:
                      "Successfully authenticated but failed to load user profile",
                    body: `Their was a problem loading your user profile ${userProfileResponse.error.code} - ${userProfileResponse.error.message}.`,
                  })
                  throw new Error(
                    "Successfully authenticated but failed to load user profile",
                  )
                }
                innerCtx.profile = userProfileResponse.data.data
                innerTask.output = `Successfully authenticated as ${userProfileResponse.data.data.email}`
              },
            },
            {
              title: "Storing credentials",
              skip: (innerCtx) => !innerCtx.credentials,
              task: async (innerCtx) => {
                if (!innerCtx.profile) {
                  throw new Error(
                    "No profile found can't complete Storing credentials task.",
                  )
                }

                if (!innerCtx.credentials) {
                  throw new Error(
                    "No credentials found can't complete Storing credentials task.",
                  )
                }

                handleClearCredentials(store)
                handleRegionUpdate(store, region)
                storeUserProfile(store, innerCtx.profile)
                storeCredentials(store, innerCtx.credentials)
                rootTask.title = "Successfully authenticated"
              },
            },
          ])
        },
      },
    ],
    {
      rendererOptions: {
        collapseSubtasks: true,
        collapseErrors: true,
      },
    },
  )
}

async function authenticateUserPassword(
  requester: EpccRequester,
  username: string,
  password: string,
): Promise<
  | { success: true; data: Credentials }
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

    const parsedCredentialsResp =
      credentialsResponseSchema.safeParse(credentialsResp)

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
        message: resolveEPCCErrorMessage(parsedCredentialsResp.data.errors),
      }
    }

    return {
      success: true,
      data: parsedCredentialsResp.data,
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
