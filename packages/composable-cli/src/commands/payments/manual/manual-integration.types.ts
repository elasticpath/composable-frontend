import { PaymentsCommandArguments } from "../payments.types"

export type ManualCommandData = {}

export type ManualCommandError =
  | {
      code: string
      message: string
    }
  | ManualCommandErrorAlreadyExists

export type ManualCommandErrorAlreadyExists = {
  code: "manual_already_setup"
  message: string
  accountId: string
}

export type ManualCommandArguments = {
  force?: boolean
} & PaymentsCommandArguments
