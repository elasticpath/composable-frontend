import { SetupCommandArguments } from "../setup.types"

export type SelfSignupCommandData = {}

export type SelfSignupCommandError =
  | {
      code: string
      message: string
    }
  | SelfSignupCommandErrorAlreadyExists

export type SelfSignupCommandErrorAlreadyExists = {
  code: "self_signup_already_setup"
  message: string
  accountId: string
}

export type SelfSignupCommandArguments = {
  force?: boolean
} & SetupCommandArguments
