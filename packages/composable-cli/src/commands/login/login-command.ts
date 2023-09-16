import yargs, { MiddlewareFunction } from "yargs"
import inquirer from "inquirer"
import Conf from "conf"
import { resolveHostFromRegion } from "../../util/resolve-region"
import ora from "ora"
import { checkIsErrorResponse } from "../../util/epcc-error"
import { epccUserProfile } from "../../util/epcc-user-profile"
import { CommandContext, CommandHandlerFunction } from "../../types/command"
import { handleErrors } from "../../util/error-handler"
import { LoginCommandData, LoginCommandError } from "./login.types"
import { outputWelcome } from "./welcome-message"
import { resolveRegion } from "../../util/conf-store/resolve-region"
import { authenticateGrantTypePassword } from "./epcc-authenticate"
import { storeCredentials } from "../../util/conf-store/store-credentials"
import { isAuthenticated } from "../../util/check-authenticated"

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

/**
 * Username and password prompts
 */
const loginPrompts = {
  type: "list",
  name: "authenticationType",
  message: "How do you want want to authenticate?",
  choices: ["Username/Password"] as const,
} as const

function handleRegionUpdate(store: Conf, region: "eu-west" | "us-east"): void {
  store.set("region", region)
}

type LoginCommandArguments = { username: string | undefined }

export function createLoginCommand(
  ctx: CommandContext
): yargs.CommandModule<{}, LoginCommandArguments> {
  return {
    command: "login [username]",
    describe: "Login to the Composable CLI",
    builder: (yargs) => {
      return yargs.positional("username", {
        describe: "Your username",
        type: "string",
      })
    },
    handler: handleErrors(createLoginCommandHandler(ctx)),
  }
}

export function createAuthenticationMiddleware(
  ctx: CommandContext
): MiddlewareFunction {
  return async function authenticationMiddleware(argv: any) {
    const { store } = ctx

    if (isAuthenticated(store)) {
      console.log("inside middleware authenticated")
      return
    }

    console.log("inside middleware not authenticated")

    return handleErrors(createLoginCommandHandler(ctx))(argv)
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

  return async function loginCommandHandler(_args) {
    const regionAnswers = await inquirer.prompt(regionPrompts)

    if (regionAnswers.region) {
      handleRegionUpdate(store, regionAnswers.region)
    }

    const loginTypeAnswers = await inquirer.prompt(loginPrompts)

    if (loginTypeAnswers.authenticationType === "Username/Password") {
      const { username, password } = await promptUsernamePasswordLogin()
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
        spinner.warn(
          "Successfully authenticated but failed to load user profile"
        )
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
      spinner.succeed(
        `Successfully authenticated as ${userProfileResponse.data.data.email}`
      )
      outputWelcome(userProfileResponse.data)
      return {
        success: true,
        data: {},
      }
    }

    return {
      success: false,
      error: {
        code: "authentication-failure",
        message: "Unsupported authentication type",
      },
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

async function promptUsernamePasswordLogin(): Promise<{
  username: string
  password: string
}> {
  return inquirer.prompt([
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
  ])
}
