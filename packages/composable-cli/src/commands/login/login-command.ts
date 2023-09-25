import yargs, { MiddlewareFunction } from "yargs"
import inquirer from "inquirer"
import Conf from "conf"
import { resolveHostFromRegion } from "../../util/resolve-region"
import ora from "ora"
import { checkIsErrorResponse } from "../../util/epcc-error"
import { epccUserProfile } from "../../util/epcc-user-profile"
import {
  CommandContext,
  CommandHandlerFunction,
  RootCommandArguments,
} from "../../types/command"
import { handleErrors } from "../../util/error-handler"
import {
  LoginCommandArguments,
  LoginCommandData,
  LoginCommandError,
} from "./login.types"
import { resolveRegion } from "../../util/conf-store/resolve-region"
import { authenticateGrantTypePassword } from "./epcc-authenticate"
import {
  handleClearCredentials,
  storeCredentials,
  storeUserProfile,
} from "../../util/conf-store/store-credentials"
import { isAuthenticated } from "../../util/check-authenticated"
import React from "react"
import { WelcomeNote } from "../ui/login/welcome-note"
import { render } from "ink"
import { trackCommandHandler } from "../../util/track-command-handler"

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

/*
choices: [
              {
                name: "North America (free-trial region)",
                value: "useast.api.elasticpath.com",
              },
              {
                name: "Europe",
                value: "euwest.api.elasticpath.com",
              },
              new inquirer.Separator(),
              {
                name: "Other",
                value: "Other",
              },
            ],
 */

function handleRegionUpdate(store: Conf, region: "eu-west" | "us-east"): void {
  store.set("region", region)
}

export function createLoginCommand(
  ctx: CommandContext
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
          "using command line arguments"
        )
        .fail(false)
        .help()
        .parserConfiguration({
          "strip-aliased": true,
        })
    },
    handler: handleErrors(trackCommandHandler(ctx, createLoginCommandHandler)),
  }
}

export function createAuthenticationMiddleware(
  ctx: CommandContext
): MiddlewareFunction<LoginCommandArguments> {
  return async function authenticationMiddleware(
    args: yargs.ArgumentsCamelCase<LoginCommandArguments>
  ) {
    const { store } = ctx

    if (isAuthenticated(store) || !args.interactive) {
      return
    }

    return handleErrors(trackCommandHandler(ctx, createLoginCommandHandler))(
      args
    )
  }
}

export function createLoginCommandHandler(
  ctx: CommandContext
): CommandHandlerFunction<
  LoginCommandData,
  LoginCommandError,
  LoginCommandArguments
> {
  const { store } = ctx

  return async function loginCommandHandler(args) {
    const regionAnswers = await inquirer.prompt(regionPrompts, {
      ...(args.region ? { region: args.region } : {}),
    })

    handleClearCredentials(store)

    if (regionAnswers.region) {
      handleRegionUpdate(store, regionAnswers.region)
    }

    const { username, password } = await promptUsernamePasswordLogin(args)
    const region = resolveRegion(store)
    const apiHost = resolveHostFromRegion(region)

    const spinner = ora("Authenticating").start()

    const result = await authenticateUserPassword(
      store,
      apiHost,
      username,
      password
    )

    if (!result.success) {
      spinner.fail("Failed to authenticate")
      console.log("There was a problem logging you in.")
      console.log(`${result.name}`)
      console.log(result.message)
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
      apiHost,
      (result as any).data?.access_token
    )

    if (!userProfileResponse.success) {
      spinner.warn("Successfully authenticated but failed to load user profile")
      console.warn(
        "Their was a problem loading your user profile.",
        userProfileResponse.error.code,
        userProfileResponse.error.message
      )
      return {
        success: true,
        data: {},
      }
    }

    storeUserProfile(store, userProfileResponse.data.data)

    spinner.succeed(
      `Successfully authenticated as ${userProfileResponse.data.data.email}`
    )

    await render(
      React.createElement(WelcomeNote, {
        name: userProfileResponse.data.data.name,
      })
    )
    return {
      success: true,
      data: {},
    }
  }
}

async function authenticateUserPassword(
  store: Conf,
  apiHost: string,
  username: string,
  password: string
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
      apiHost,
      username,
      password
    )

    if (checkIsErrorResponse(credentialsResp)) {
      return {
        success: false,
        code: "authentication-failure",
        name: "epcc error",
        message: credentialsResp.errors.toString(),
      }
    }

    storeCredentials(store, credentialsResp as any)

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
  args: LoginCommandArguments
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
    }
  )
}
