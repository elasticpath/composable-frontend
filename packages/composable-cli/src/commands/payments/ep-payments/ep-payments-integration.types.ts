import { PaymentsCommandArguments } from "../payments.types"

export type EPPaymentsCommandData = {
  accountId: string
  publishableKey: string
}

export type EPPaymentsCommandError =
  | {
      code: string
      message: string
    }
  | EPPaymentsCommandErrorAlreadyExists

export type EPPaymentsCommandErrorAlreadyExists = {
  code: "ep_payments_already_setup"
  message: string
  accountId: string
}

export type EPPaymentsCommandArguments = {
  accountId?: string
  publishableKey?: string
  force?: boolean
} & PaymentsCommandArguments
